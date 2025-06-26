"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot, MessageCircle, Star, Brain } from "lucide-react";

export default function ChatDemo() {
  return (
    <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-purple-50 to-cyan-50 rounded-xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Brain className="h-8 w-8 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold text-gray-800">
          Chat Modernizado! ✨
        </h3>
        <p className="text-gray-600 max-w-md">
          O chatbot agora possui visual premium com animações fluidas,
          notificações elegantes e envio automático de sugestões!
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <span>Powered by Gemini 2.0 Flash</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
