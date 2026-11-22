"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Home, Film, Tv, ArrowLeft, LogIn } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [context, setContext] = useState<{
    type: "home" | "details" | "search" | "collection" | "profile" | "unknown";
    message: string;
    description: string;
  }>({
    type: "unknown",
    message: "Página não encontrada",
    description: "A página que você está procurando não existe ou foi movida.",
  });

  useEffect(() => {
    const storedPath = sessionStorage.getItem("previous_path");
    const referrer = document.referrer;
    const prevPath =
      storedPath || (referrer ? new URL(referrer).pathname : null);
    setPreviousPath(prevPath);

    if (pathname.includes("/filme/") || pathname.includes("/serie/")) {
      setContext({
        type: "details",
        message: "Título não encontrado",
        description: "O filme ou série que você está procurando não está disponível em nosso catálogo.",
      });
    } else if (pathname.includes("/colecao/")) {
      setContext({
        type: "collection",
        message: "Coleção não encontrada",
        description: "Esta saga, universo ou estúdio não foi encontrado em nosso catálogo.",
      });
    } else {
      setContext({
        type: "unknown",
        message: "Página não encontrada",
        description: "A página que você está procurando não existe ou foi movida.",
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 pt-20 pb-16">
      <div className="max-w-lg w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 text-center space-y-6 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/images/logos/icon.png"
              alt="Onde Tá Passando?"
              width={44}
              height={44}
              className="rounded-xl shadow-lg shadow-red-600/20"
              priority
            />
          </Link>
        </div>

        {/* Código 404 */}
        <div className="space-y-2">
          <div className="font-bebas text-7xl md:text-8xl text-red-600 leading-none tracking-wider">
            404
          </div>
          <h1 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
            {context.message}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto pt-1">
            {context.description}
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="w-full sm:w-auto h-11 px-5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer leading-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto h-11 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer leading-none shadow-lg shadow-red-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Ir para o Início</span>
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-11 px-5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer leading-none"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}
        </div>

        {/* Links rápidos */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Ou explore o catálogo
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/filmes"
              className="h-8 px-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/25 text-neutral-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors leading-none"
            >
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>Filmes</span>
            </Link>
            <Link
              href="/series"
              className="h-8 px-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/25 text-neutral-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors leading-none"
            >
              <Tv className="w-3.5 h-3.5 text-red-500" />
              <span>Séries</span>
            </Link>
            <Link
              href="/sintonia"
              className="h-8 px-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/25 text-neutral-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors leading-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 text-red-500"
                aria-hidden="true"
              >
                <path d="M2 10v3" />
                <path d="M6 6v11" />
                <path d="M10 3v18" />
                <path d="M14 8v7" />
                <path d="M18 5v13" />
                <path d="M22 10v3" />
              </svg>
              <span>Sintonia</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
