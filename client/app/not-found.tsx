"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Home, Film, Tv, ArrowLeft, Sparkles, LogIn } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [context, setContext] = useState<{
    type: "home" | "details" | "search" | "collection" | "profile" | "unknown";
    message: string;
    suggestions: string[];
  }>({
    type: "unknown",
    message: "Página não encontrada",
    suggestions: [],
  });

  useEffect(() => {
    // Detectar contexto baseado na URL anterior
    const storedPath = sessionStorage.getItem("previous_path");
    const referrer = document.referrer;

    // Usar referrer se disponível, senão usar sessionStorage
    const prevPath =
      storedPath || (referrer ? new URL(referrer).pathname : null);
    setPreviousPath(prevPath);

    // Analisar o caminho atual para entender o contexto
    if (pathname.includes("/filme/") || pathname.includes("/serie/")) {
      setContext({
        type: "details",
        message: "Este filme ou série não foi encontrado",
        suggestions: [
          "Verifique se o ID está correto",
          "Explore outros títulos em alta",
          "Use a busca para encontrar o que procura",
        ],
      });
    } else if (pathname.includes("/colecao/")) {
      setContext({
        type: "collection",
        message: "Esta coleção não foi encontrada",
        suggestions: [
          "Explore outras coleções disponíveis",
          "Volte para a página inicial",
          "Descubra novos universos",
        ],
      });
    } else if (pathname.includes("/busca")) {
      setContext({
        type: "search",
        message: "Nenhum resultado encontrado",
        suggestions: [
          "Tente termos de busca diferentes",
          "Verifique a ortografia",
          "Explore por gêneros",
        ],
      });
    } else if (pathname.includes("/perfil")) {
      setContext({
        type: "profile",
        message: "Página não encontrada",
        suggestions: [
          "Verifique se você está logado",
          "Acesse sua conta",
          "Volte para a página inicial",
        ],
      });
    } else if (storedPath === "/" || !storedPath) {
      setContext({
        type: "home",
        message: "Página não encontrada",
        suggestions: [
          "Volte para a página inicial",
          "Explore filmes e séries em alta",
          "Use a busca para encontrar conteúdo",
        ],
      });
    } else {
      setContext({
        type: "unknown",
        message: "Página não encontrada",
        suggestions: [
          "A página que você procura não existe",
          "Volte para a página inicial",
          "Explore nosso catálogo",
        ],
      });
    }
  }, [pathname]);

  const handleGoBack = () => {
    if (previousPath && previousPath !== pathname) {
      router.push(previousPath);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Onde Tá Passando?"
              width={200}
              height={200}
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Código 404 */}
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl md:text-3xl font-semibold">
              {context.message}
            </h2>
          </div>
        </div>

        {/* Mensagem contextual */}
        <div className="space-y-4">
          <p className="text-gray-400 text-lg">
            {context.type === "details" && (
              <>O conteúdo que você está procurando não está disponível.</>
            )}
            {context.type === "collection" && (
              <>Esta coleção não foi encontrada em nosso catálogo.</>
            )}
            {context.type === "search" && (
              <>Não encontramos resultados para sua busca.</>
            )}
            {context.type === "profile" && !isAuthenticated && (
              <>Você precisa estar logado para acessar esta página.</>
            )}
            {(context.type === "home" || context.type === "unknown") && (
              <>A página que você está procurando não existe ou foi movida.</>
            )}
          </p>

          {/* Sugestões */}
          {context.suggestions.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-6 text-left space-y-2">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />O que você pode
                fazer:
              </h3>
              <ul className="space-y-2">
                {context.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-gray-300 text-sm flex items-start gap-2"
                  >
                    <span className="text-red-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>

          {!isAuthenticated && (
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          )}
        </div>

        {/* Links rápidos */}
        <div className="pt-12 pb-16 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-6">Ou explore:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/filmes"
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              <Film className="w-4 h-4" />
              Filmes
            </Link>
            <Link
              href="/series"
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              <Tv className="w-4 h-4" />
              Séries
            </Link>
            {isAuthenticated && (
              <Link
                href="/perfil"
                className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                Meu Perfil
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
