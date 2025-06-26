import { useState, useCallback } from "react";
import {
  ChatMessage,
  MovieContext,
  sendMessageToGemini,
} from "@/services/gemini-api";

export const useMovieChat = (movieContext: MovieContext) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const response = await sendMessageToGemini(
          content.trim(),
          movieContext,
          messages
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");

        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente! 😅",
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
  }, []);

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
