"use client";

import { useEffect, useCallback } from "react";
import { useLoadingStore } from "@/store/loading-store";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingOverlay() {
  const { isLoading, title, setLoading } = useLoadingStore();

  // Função de segurança para garantir que o loading não fique preso
  const safetyTimeoutReset = useCallback(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000); // Tempo máximo de loading de 5 segundos
      return () => clearTimeout(timer);
    }
  }, [isLoading, setLoading]);

  // Efeito para garantir que o loading nunca fique travado
  useEffect(() => {
    return safetyTimeoutReset();
  }, [isLoading, safetyTimeoutReset]);

  // Capturar evento de navegação completa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLoading) {
        setLoading(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, setLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-24 h-24">
              <Image
                src="/images/logo.png"
                alt="Onde Tá Passando? Logo"
                fill
                className="object-contain animate-pulse"
              />
            </div>
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-medium text-center text-white"
            >
              {title ? `Carregando ${title}...` : "Carregando..."}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
