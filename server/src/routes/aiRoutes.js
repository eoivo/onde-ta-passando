const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { protect } = require("../middleware/auth");
const rateLimit = require("express-rate-limit");

// Chave híbrida: prioriza o ID do usuário autenticado (evita burlar trocando de IP) com fallback para IP
const getRateLimitKey = (req) => {
  if (req.user && req.user._id) {
    return `user_${req.user._id.toString()}`;
  }
  return req.ip;
};

// 1) Limite de curto prazo (Burst): 12 mensagens a cada 15 minutos
const aiBurstLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyGenerator: getRateLimitKey,
  message: {
    success: false,
    message: "Você atingiu o limite de 12 mensagens a cada 15 minutos. Aguarde um pouco para continuar a conversa com a Murphy."
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// 2) Teto diário: 40 mensagens por dia por usuário/IP (protege a cota diária gratuita do Gemini)
const aiDailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 40,
  keyGenerator: getRateLimitKey,
  message: {
    success: false,
    message: "Você atingiu o limite diário de demonstração da Murphy (40 mensagens). Volte amanhã para continuar conversando."
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
});

// @route   POST /api/ai/chat
// @access  Private (Requer login + Duplo Rate Limit)
router.post("/chat", protect, aiDailyLimiter, aiBurstLimiter, aiController.chat);

module.exports = router;
