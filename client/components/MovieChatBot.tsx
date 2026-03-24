"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  User,
  Copy,
  Check,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  MovieContext,
  generateWelcomeMessage,
  generateSuggestedTopics,
} from "@/services/gemini-api";
import { useMovieChat } from "@/hooks/useMovieChat";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface MovieChatBotProps {
  movieContext: MovieContext;
}

const MessageContent: React.FC<{ content: string; isAssistant: boolean }> = ({
  content,
  isAssistant,
}) => {
  if (!isAssistant) {
    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="text-[15px] leading-relaxed">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 text-neutral-200">{children}</p>,
          ul: ({ children }) => <ul className="ml-5 mb-3 space-y-2 text-neutral-200">{children}</ul>,
          li: ({ children }) => <li className="list-disc marker:text-neutral-500">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-red-200">{children}</strong>,
          em: ({ children }) => <em className="italic text-neutral-400">{children}</em>,
          code: ({ children }) => (
            <code className="bg-red-500/10 text-red-100 px-1.5 py-0.5 rounded-md text-sm font-mono border border-red-500/20">
              {children}
            </code>
          ),
          h3: ({ children }) => <h3 className="text-[17px] font-medium text-white mt-5 mb-2">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function MovieChatBot({ movieContext }: MovieChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { isAuthenticated, user } = useAuth();
  const {
    messages,
    isLoading,
    sendMessage,
    addWelcomeMessage,
  } = useMovieChat(movieContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChatButtonClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setIsOpen(true);
  };

  const handleLoginRedirect = () => {
    setShowAuthDialog(false);
    router.push("/login");
  };

  const handleRegisterRedirect = () => {
    setShowAuthDialog(false);
    router.push("/cadastro");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !hasInitialized && isAuthenticated) {
      const initializeChat = async () => {
        try {
          setIsTyping(true);
          await new Promise((resolve) => setTimeout(resolve, 800));

          const userName = user?.name?.split(" ")[0] || "agora";
          const welcomeMessage = await generateWelcomeMessage(
            movieContext,
            userName
          );
          const topics = generateSuggestedTopics(movieContext);

          addWelcomeMessage(welcomeMessage);
          setSuggestedTopics(topics);
          setHasInitialized(true);
          setIsTyping(false);
        } catch (error) {
          console.error("Erro ao inicializar chat:", error);
          const userName = user?.name?.split(" ")[0] || "agora";
          addWelcomeMessage(
            `Olá, ${userName}. Sou a Murphy. Como posso te ajudar a descobrir mais sobre "${movieContext.title}"?`
          );
          setIsTyping(false);
        }
      };

      initializeChat();
    }
  }, [isOpen, hasInitialized, movieContext, addWelcomeMessage, isAuthenticated, user]);

  const handleSendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputValue.trim();
    if (!message || isLoading) return;

    setInputValue("");
    setSuggestedTopics([]);

    // Mostra o feedback visual antes de enviar de fato
    scrollToBottom();
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
    await handleSendMessage(topic);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(index);
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <>
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-medium tracking-tight">
              Login Necessário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400 text-[15px] leading-relaxed pt-2">
              Para conversar com a inteligência artificial sobre <span className="text-white font-medium">"{movieContext.title}"</span>, você
              precisa estar conectado à sua conta.
              <br />
              <br />
              Crie uma conta gratuita em poucos segundos para receber recomendações e análises profundas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel
              className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
              onClick={() => setShowAuthDialog(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleRegisterRedirect}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Conta
            </Button>
            <AlertDialogAction
              onClick={handleLoginRedirect}
              className="bg-white text-black hover:bg-neutral-200 font-medium"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div 
          className="relative w-full md:w-[280px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Button
            onClick={handleChatButtonClick}
            size="lg"
            className="relative gap-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/15 shadow-2xl transition-all duration-300 w-full justify-center md:rounded-2xl rounded-xl h-14 overflow-hidden group"
          >
            {/* Efeito Shimmer Animado */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 4 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            />

            <motion.div
              animate={isHovered ? { y: -2, rotate: [-5, 5, 0] } : {}}
            >
              <MessageCircle className="h-[18px] w-[18px] opacity-70" strokeWidth={2.5} />
            </motion.div>

            <span className="font-medium tracking-wide flex items-center gap-2">
              Conversar com a Murphy
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
            </span>
          </Button>
        </div>

        <DialogContent className="h-[92dvh] md:h-[85vh] mx-auto w-full md:w-[calc(100%-2rem)] max-w-3xl flex flex-col p-0 bg-neutral-950/80 backdrop-blur-2xl border-x-0 border-b-0 border-t border-white/10 md:border md:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-t-[32px] md:rounded-3xl overflow-hidden focus:outline-none focus-visible:outline-none outline-none">
          {/* Header Minimalista Responsivo */}
          <DialogHeader className="px-5 py-4 bg-transparent border-b border-white/5 flex-shrink-0 flex flex-row items-center gap-4 space-y-0 text-left">
            <DialogTitle className="sr-only">Chat com Murphy</DialogTitle>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-900 border border-white/5 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/images/murphy.png"
                alt="Murphy"
                className="w-full h-full object-cover"
                width={40}
                height={40}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold text-white tracking-tight mb-1">Murphy AI</span>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                <span>{movieContext.mediaType === "movie" ? "Filme" : "Série"}</span>
                <span className="w-1 h-1 rounded-full bg-red-600/60" />
                <span className="text-neutral-400 line-clamp-1 max-w-[180px] normal-case tracking-normal">"{movieContext.title}"</span>
              </div>
            </div>
          </DialogHeader>

          {/* Área de Mensagens */}
          <ScrollArea className="flex-1 px-2" data-lenis-prevent>
            <div className="p-3 md:p-5 space-y-7 pt-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`flex gap-3 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-900 border border-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                        <Image
                          src="/images/murphy.png"
                          alt="Murphy"
                          className="w-full h-full object-cover opacity-90"
                          width={32}
                          height={32}
                        />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1.5 max-w-[88%] md:max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`shadow-sm ${message.role === "user"
                          ? "px-5 py-3 bg-white/10 backdrop-blur-md text-white rounded-[20px] rounded-br-[4px] border border-white/5"
                          : "px-2 py-1 bg-transparent text-neutral-200"
                          }`}
                      >
                        <MessageContent
                          content={message.content}
                          isAssistant={message.role === "assistant"}
                        />
                      </div>

                      {/* Metadados da Mensagem (Hora e Cópia) */}
                      <div className={`flex items-center gap-3 px-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.role === "assistant" && (
                          <button
                            onClick={() => copyToClipboard(message.content, index)}
                            className="text-neutral-500 hover:text-white transition-colors"
                            title="Copiar mensagem"
                          >
                            {copiedMessage === index ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loader Minimalista (Bouncing Dots) */}
              {(isLoading || isTyping) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start items-end"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-900 border border-white/5 flex items-center justify-center flex-shrink-0 mb-1">
                    <Image
                      src="/images/murphy.png"
                      alt="Murphy"
                      className="w-full h-full object-cover opacity-50 grayscale"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 h-10 px-4">
                    <motion.div
                      className="w-1.5 h-1.5 bg-red-600/40 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-red-600/40 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-red-600/40 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Tópicos Sugeridos Clean */}
              {!isLoading && !isTyping && suggestedTopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2 pt-2 ml-10"
                >
                  {suggestedTopics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedTopicClick(topic)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[13px] text-neutral-300 font-medium rounded-2xl transition-all duration-200 text-left"
                    >
                      {topic}
                    </button>
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          </ScrollArea>

          {/* Área de Input "Inner Pill Glass" com Safe Area */}
          <div className="p-3 md:p-5 bg-transparent border-t border-white/5 pb-[calc(12px+env(safe-area-inset-bottom))] md:pb-5">
            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-[24px] p-1.5 backdrop-blur-md focus-within:border-white/20 focus-within:bg-white/10 transition-all duration-300">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Envie uma mensagem..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 h-10 text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-neutral-500 shadow-none px-4"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className={`h-10 w-10 shrink-0 rounded-full transition-all duration-300 focus:ring-0 focus:outline-none focus:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 ${inputValue.trim() && !isLoading
                  ? "bg-red-600 text-white hover:bg-red-700 scale-100 shadow-none"
                  : "bg-white/10 text-neutral-500 scale-95 opacity-50"
                  }`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
