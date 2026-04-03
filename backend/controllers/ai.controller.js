import { getRecommendation, chat, clearSession } from "../services/ai.service.js";
import { errorHandler } from "../utils/error.js";

// POST /api/ai/recommend
export const recommend = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return next(errorHandler(400, "El campo 'message' es requerido."));
    }

    const userInput = message.trim().slice(0, 500);
    const reply = await getRecommendation(userInput);

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("[AI Recommend Error]", error.message, error.status ?? "");
    if (error.message?.includes("API key") || error.status === 401) {
      return next(errorHandler(401, "API key de OpenAI inválida o revocada."));
    }
    return next(errorHandler(500, error.message || "Error al procesar la recomendación de IA."));
  }
};

// POST /api/ai/chat
export const chatbot = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return next(errorHandler(400, "El campo 'message' es requerido."));
    }

    const sid = typeof sessionId === "string" && sessionId.trim() ? sessionId.trim() : "default";
    const userInput = message.trim().slice(0, 500);
    const reply = await chat(sid, userInput);

    return res.status(200).json({ success: true, reply, sessionId: sid });
  } catch (error) {
    console.error("[AI Chat Error]", error.message, error.status ?? "");
    if (error.message?.includes("API key") || error.status === 401) {
      return next(errorHandler(401, "API key de OpenAI inválida o revocada."));
    }
    return next(errorHandler(500, error.message || "Error al procesar el chat de IA."));
  }
};

// POST /api/ai/chat/clear
export const clearChat = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      return next(errorHandler(400, "El campo 'sessionId' es requerido."));
    }

    clearSession(sessionId.trim());
    return res.status(200).json({ success: true, message: "Historial de sesión eliminado." });
  } catch (error) {
    console.error("[AI Clear Error]", error.message);
    return next(errorHandler(500, "Error al limpiar la sesión."));
  }
};
