import express from "express";
import { recommend, chatbot, clearChat } from "../controllers/ai.controller.js";

const router = express.Router();

// Recomendación sin estado (una sola interacción)
router.post("/recommend", recommend);

// Chat con memoria de sesión
router.post("/chat", chatbot);

// Limpiar historial de una sesión
router.post("/chat/clear", clearChat);

export default router;
