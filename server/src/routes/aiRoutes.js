const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const rateLimit = require("express-rate-limit");

// Configurando Rate Limit específico para a IA (Murphy)
// Protege seu limite gratuito do Gemini contra abusos/bots
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Limita cada IP a 15 requisições por janela (1 por minuto em média)
  message: {
    success: false,
    message: "Murphy está um pouco sobrecarregada agora! Espere alguns minutos para continuar a conversa. 👋🎬"
  },
  standardHeaders: true, // Retorna info do rate limit nos headers 'RateLimit-*'
  legacyHeaders: false, // Desabilita os headers 'X-RateLimit-*'
});

// @route   POST /api/ai/chat
// @access  Public (Com Rate Limit)
router.post("/chat", aiLimiter, aiController.chat);

module.exports = router;
