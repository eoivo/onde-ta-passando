import { useState, useCallback, useEffect } from "react";
import {
  ChatMessage,
  MovieContext,
  sendMessageToGemini,
} from "@/services/gemini-api";

const getStorageKey = (movieContext: MovieContext) =>
  `murphy_chat_${movieContext.mediaType}_${movieContext.title.trim().toLowerCase()}`;

export const useMovieChat = (movieContext: MovieContext) => {
  const storageKey = getStorageKey(movieContext);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza mensagens com sessionStorage para persistir durante a sessão/navegação
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Ignora erro de quota do sessionStorage
    }
  }, [messages, storageKey]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const { reply, thoughtSignature } = await sendMessageToGemini(
          content.trim(),
          movieContext,
          messages
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: reply,
          timestamp: new Date(),
          thoughtSignature: thoughtSignature || undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorText =
          err instanceof Error && err.message
            ? err.message
            : "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes.";
        setError(errorText);

        const errorMessage: ChatMessage = {
          role: "assistant",
          content: errorText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [movieContext, messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
    }
  }, [storageKey]);

  const addWelcomeMessage = useCallback((welcomeContent: string) => {
    const welcomeMessage: ChatMessage = {
      role: "assistant",
      content: welcomeContent,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addWelcomeMessage,
  };
};
