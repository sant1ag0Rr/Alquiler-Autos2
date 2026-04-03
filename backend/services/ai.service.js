import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import Vehicle from "../models/vehicleModel.js";

// ─── Memoria de sesiones en memoria ────────────────────────────────────────────
const sessionStore = new Map();
const MAX_HISTORY_PAIRS = 8; // máximo de pares pregunta/respuesta por sesión

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getAvailableVehicles() {
  return Vehicle.find({
    isBooked: false,
    isAdminApproved: true,
    isRejected: false,
    isDeleted: { $ne: "true" },
  })
    .select(
      "company name model year_made price seats transmition fuel_type car_type location district description car_title"
    )
    .limit(50)
    .lean();
}

function formatVehiclesForPrompt(vehicles) {
  if (!vehicles.length) return "No hay vehículos disponibles en este momento.";

  return vehicles
    .map((v, i) => {
      const nombre = [v.company, v.name || v.car_title, v.model]
        .filter(Boolean)
        .join(" ");
      return (
        `${i + 1}. ${nombre} (${v.year_made || "N/A"})\n` +
        `   Precio: $${v.price ?? "N/A"}/día | Asientos: ${v.seats ?? "N/A"} | ` +
        `Transmisión: ${v.transmition ?? "N/A"} | Combustible: ${v.fuel_type ?? "N/A"}\n` +
        `   Tipo: ${v.car_type ?? "N/A"} | Ubicación: ${v.location ?? "N/A"}, ${v.district ?? "N/A"}\n` +
        (v.description ? `   Descripción: ${v.description}` : "")
      );
    })
    .join("\n\n");
}

function buildChatModel() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "tu-groq-api-key-aqui") {
    throw new Error("GROQ_API_KEY no configurada.");
  }
  return new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 600,
    apiKey,
  });
}

const SYSTEM_TEMPLATE = `Eres un asistente experto en alquiler de autos. Tu misión es ayudar a los clientes a encontrar el vehículo ideal según sus necesidades.

Reglas:
- Responde siempre en español de forma amigable y concisa.
- Solo recomienda vehículos de la lista proporcionada.
- Explica brevemente por qué recomiendas cada opción.
- Si ningún vehículo cumple los requisitos, indícalo amablemente y sugiere la alternativa más cercana.
- No inventes vehículos ni precios.

Vehículos disponibles actualmente:
{cars}`;

// ─── Servicio de Recomendación (sin historial) ──────────────────────────────────

export async function getRecommendation(userMessage) {
  const vehicles = await getAvailableVehicles();
  const vehicleList = formatVehiclesForPrompt(vehicles);

  const model = buildChatModel();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{user_input}"],
  ]);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    cars: vehicleList,
    user_input: userMessage,
  });

  return response.content;
}

// ─── Servicio de Chat con Memoria de Sesión ─────────────────────────────────────

export async function chat(sessionId, userMessage) {
  const vehicles = await getAvailableVehicles();
  const vehicleList = formatVehiclesForPrompt(vehicles);

  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, []);
  }
  const history = sessionStore.get(sessionId);

  const systemPrompt = SYSTEM_TEMPLATE.replace("{cars}", vehicleList);
  const messages = [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(userMessage),
  ];

  const model = buildChatModel();
  const response = await model.invoke(messages);

  // Actualizar historial y limitar tamaño
  history.push(new HumanMessage(userMessage));
  history.push(new AIMessage(response.content));
  if (history.length > MAX_HISTORY_PAIRS * 2) {
    history.splice(0, 2); // elimina el par más antiguo
  }
  sessionStore.set(sessionId, history);

  return response.content;
}

// ─── Limpiar sesión ─────────────────────────────────────────────────────────────

export function clearSession(sessionId) {
  sessionStore.delete(sessionId);
}
