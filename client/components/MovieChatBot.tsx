"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Zap,
  Brain,
  Star,
  MessageSquare,
  Mic,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MovieContext,
  generateWelcomeMessage,
  generateSuggestedTopics,
} from "@/services/gemini-api";
import { useMovieChat } from "@/hooks/useMovieChat";
import toast from "react-hot-toast";

interface MovieChatBotProps {
  movieContext: MovieContext;
}

export default function MovieChatBot({ movieContext }: MovieChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    addWelcomeMessage,
  } = useMovieChat(movieContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      const initializeChat = async () => {
        try {
          setIsTyping(true);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula digitação
          const welcomeMessage = await generateWelcomeMessage(movieContext);
          const topics = generateSuggestedTopics(movieContext);

          addWelcomeMessage(welcomeMessage);
          setSuggestedTopics(topics);
          setHasInitialized(true);
          setIsTyping(false);
          toast.success(`Chat iniciado sobre "${movieContext.title}"! 🎬`);
        } catch (error) {
          console.error("Erro ao inicializar chat:", error);
          addWelcomeMessage(
            `Olá! Vamos conversar sobre "${movieContext.title}"? 🎬`
          );
          setIsTyping(false);
          toast.error("Erro ao inicializar chat");
        }
      };

      initializeChat();
    }
  }, [isOpen, hasInitialized, movieContext, addWelcomeMessage]);

  const handleSendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputValue.trim();
    if (!message || isLoading) return;

    setInputValue("");
    setSuggestedTopics([]);

    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedTopicClick = async (topic: string) => {
    setSuggestedTopics([]);
    toast.success("Enviando sugestão...");
    await handleSendMessage(topic);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(index);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      toast.error("Erro ao copiar mensagem");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 },
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="relative gap-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white border-0 hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"
          >
            <Sparkles className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Conversar com a Murphy</span>
            <Zap className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="h-[90vh] mx-auto my-auto w-[calc(100%-2rem)] max-w-4xl flex flex-col p-0 bg-gradient-to-br from-gray-900 to-black border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="p-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 backdrop-blur-sm" />
            <DialogTitle className="relative z-10 flex items-center gap-3 text-xl font-bold">
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
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30 flex items-center justify-center"
              >
                <Image
                  src="/images/murphy.png"
                  alt="Murphy"
                  className="w-full h-full object-cover"
                  width={48}
                  height={48}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const brainIcon = target.nextElementSibling as HTMLElement;
                    target.style.display = "none";
                    if (brainIcon) {
                      brainIcon.style.display = "block";
                    }
                  }}
                />
                <Brain className="h-6 w-6 text-white hidden" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span>Murphy</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star className="h-4 w-4 text-yellow-300" />
                  </motion.div>
                </div>
                <div className="text-sm font-normal text-red-100">
                  Especialista em "{movieContext.title}"
                </div>
              </div>
              <Badge
                variant="secondary"
                className="ml-auto bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                {movieContext.mediaType === "movie" ? "Filme" : "Série"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-gray-900">
            <div className="p-6 pt-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`flex gap-4 items-start ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg overflow-hidden border-2 border-red-400/30">
                          <Image
                            src="/images/murphy.png"
                            alt="Murphy"
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                            onError={(e) => {
                              const target = e.currentTarget;
                              const botIcon =
                                target.nextElementSibling as HTMLElement;
                              target.style.display = "none";
                              if (botIcon) {
                                botIcon.style.display = "block";
                              }
                            }}
                          />
                          <Bot className="h-5 w-5 text-white hidden" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] ${
                        message.role === "user" ? "order-2" : ""
                      }`}
                    >
                      <div
                        className={`relative p-4 rounded-2xl shadow-lg ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white ml-auto"
                            : "bg-gray-800 text-gray-100 border border-gray-700"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm" />
                        )}

                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>

                        <div
                          className={`flex items-center justify-between mt-2 pt-2 border-t ${
                            message.role === "user"
                              ? "border-white/20"
                              : "border-gray-600"
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              message.role === "user"
                                ? "text-white/70"
                                : "text-gray-400"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>

                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(message.content, index)
                              }
                              className={`h-6 w-6 p-0 hover:bg-gray-700 ${
                                copiedMessage === index
                                  ? "text-green-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {copiedMessage === index ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 order-3 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {(isLoading || isTyping) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start items-start"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg mt-1 overflow-hidden border-2 border-red-400/30">
                    <Image
                      src="/images/murphy.png"
                      alt="Murphy"
                      className="w-full h-full object-cover"
                      width={40}
                      height={40}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const botIcon =
                          target.nextElementSibling as HTMLElement;
                        target.style.display = "none";
                        if (botIcon) {
                          botIcon.style.display = "block";
                        }
                      }}
                    />
                    <Bot className="h-5 w-5 text-white hidden" />
                  </div>
                  <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 relative">
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm" />
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="h-4 w-4 text-red-500" />
                      </motion.div>
                      <span className="text-sm text-gray-300">
                        {isTyping ? "Iniciando conversa..." : "Pensando..."}
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="h-3 w-3 text-red-400" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {suggestedTopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-4 w-4 text-red-500" />
                    </motion.div>
                    <span className="font-medium">Sugestões para começar:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge
                          variant="outline"
                          className="cursor-pointer px-3 py-2 bg-gray-800 border-red-600 hover:border-red-500 hover:bg-gray-700 text-red-300 transition-all duration-200 shadow-sm"
                          onClick={() => handleSuggestedTopicClick(topic)}
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          {topic}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-6 bg-gray-800/95 backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Pergunte algo sobre "${movieContext.title}"...`}
                  disabled={isLoading}
                  className="h-12 pr-12 bg-gray-700/80 border-0 focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0 rounded-xl shadow-sm text-sm placeholder:text-gray-400 text-white backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Mic className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="h-12 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? "linear-gradient(to right, #dc2626, #b91c1c)"
                    : "linear-gradient(to right, #ef4444, #dc2626)",
                  border: "none",
                  color: "white",
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span>
                  Powered by Gemini AI • Focado em "{movieContext.title}"
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
