import { useState, useRef, useEffect } from "react";
import Footers from "../../components/Footer";

const BASE_URL = import.meta.env.VITE_PRODUCTION_BACKEND_URL || "";

function generateSessionId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "¡Hola! Soy tu asistente de alquiler de autos 🚗\nCuéntame qué tipo de vehículo estás buscando y te ayudo a encontrar el ideal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(generateSessionId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: userMsg, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error del servidor");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "Lo siento, no pude procesar tu solicitud.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ ${err.message || "Error de conexión. Por favor intenta de nuevo."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${BASE_URL}/api/ai/chat/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // silencioso
    }
    setMessages([
      {
        role: "ai",
        text: "¡Hola! Soy tu asistente de alquiler de autos 🚗\nCuéntame qué tipo de vehículo estás buscando y te ayudo a encontrar el ideal.",
      },
    ]);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold font-poppins">Asistente IA</h1>
            <p className="text-gray-500 text-sm font-poppins mt-1">
              Describe lo que necesitas y te recomendaré el auto ideal
            </p>
          </div>
          <button
            onClick={clearChat}
            className="text-sm border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 font-poppins transition-colors"
          >
            Nueva conversación
          </button>
        </div>

        {/* Ventana de chat */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 h-[480px] overflow-y-auto flex flex-col gap-4 p-4 drop-shadow">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
                  IA
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-poppins leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gray-800 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm drop-shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0">
                IA
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 drop-shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-4">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: quiero un auto económico para familia de 5..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm font-poppins resize-none focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold text-sm font-poppins transition-colors"
          >
            Enviar
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 font-poppins text-center">
          Presiona Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
      <Footers />
    </>
  );
}

export default AiAssistant;
