"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Film, Tv, ArrowRight, TrendingUp } from "lucide-react";
import { useLoadingStore } from "@/store/loading-store";

interface MediaItem {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    media_type: "movie" | "tv";
}

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const TRENDING_SUGGESTIONS = [
    "Stranger Things",
    "The Last of Us",
    "Breaking Bad",
    "Oppenheimer",
    "Dune",
];

export default function MobileSearchOverlay({
    isOpen,
    onClose,
}: MobileSearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { setLoading: setGlobalLoading } = useLoadingStore();

    // Monta a animação de entrada
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            // Foca o input após a animação começar
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 150);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setIsMounted(false);
                setQuery("");
                setResults([]);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Bloqueia o scroll do body quando o overlay está aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Busca sugestões com debounce
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/search-suggestions?q=${encodeURIComponent(query)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setResults(data.results.slice(0, 6));
                }
            } catch (error) {
                console.error("Erro ao buscar sugestões:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Fecha com a tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setGlobalLoading(true, "resultados");
        router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
        onClose();
    };

    const handleItemClick = (id: number, mediaType: "movie" | "tv") => {
        const path = mediaType === "movie" ? `/filme/${id}` : `/serie/${id}`;
        const label = mediaType === "movie" ? "filme" : "série";
        setGlobalLoading(true, label);
        router.push(path);
        onClose();
    };

    const handleTrendingClick = (term: string) => {
        setQuery(term);
        inputRef.current?.focus();
    };

    if (!isMounted) return null;

    const showTrending = query.length < 2;
    const showResults = query.length >= 2;

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            style={{ backgroundColor: "rgba(0,0,0,0.97)" }}
            aria-modal="true"
            role="dialog"
            aria-label="Busca"
        >
            {/* Barra de busca no topo */}
            <div
                className={`flex items-center gap-3 px-4 transition-all duration-300 ${isOpen ? "translate-y-0" : "-translate-y-4"
                    }`}
                style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
            >
                {/* Botão de fechar — esquerda */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200 active:scale-95"
                    aria-label="Fechar busca"
                >
                    <X className="h-5 w-5 text-white/70" />
                </button>

                {/* Campo de input com lupa dentro — esticado */}
                <form
                    onSubmit={handleSearch}
                    className="flex-1 relative flex items-center bg-white/5 border border-gray-700 focus-within:border-red-500/60 rounded-full overflow-hidden transition-colors duration-300"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        placeholder="Buscar filmes, séries..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-white text-base placeholder-white/30 focus:outline-none pl-4 pr-12 py-3"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                    <button
                        type="submit"
                        className="absolute right-1 flex-shrink-0 w-9 h-9 rounded-full bg-red-600/20 hover:bg-red-600/40 flex items-center justify-center transition-colors duration-200 active:scale-95"
                        aria-label="Buscar"
                    >
                        <Search className="h-4 w-4 text-red-500" />
                    </button>
                </form>
            </div>

            {/* Área de conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 mt-6">

                {/* Estado: Loading */}
                {isLoading && (
                    <div className="flex items-center gap-3 py-6">
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-white/50 text-sm">Buscando...</span>
                    </div>
                )}

                {/* Estado: Sugestões trending (query vazia) */}
                {showTrending && !isLoading && (
                    <div
                        className={`transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
                                Em alta
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TRENDING_SUGGESTIONS.map((term) => (
                                <button
                                    key={term}
                                    onClick={() => handleTrendingClick(term)}
                                    className="px-4 py-2 rounded-full border border-gray-700 text-white/70 text-sm hover:border-red-500/50 hover:text-white hover:bg-red-500/10 active:scale-95 transition-all duration-200"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado: Resultados */}
                {showResults && !isLoading && (
                    <div
                        className={`transition-all duration-200 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            }`}
                    >
                        {results.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-7 w-7 text-white/20" />
                                </div>
                                <p className="text-white/40 text-base">
                                    Nenhum resultado para{" "}
                                    <span className="text-white/70">"{query}"</span>
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-4">
                                    Sugestões
                                </p>
                                <ul className="space-y-1">
                                    {results.map((item) => (
                                        <li key={`${item.media_type}-${item.id}`}>
                                            <button
                                                onClick={() =>
                                                    handleItemClick(item.id, item.media_type)
                                                }
                                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 active:scale-[0.99] transition-all duration-150 text-left"
                                            >
                                                {/* Poster */}
                                                <div className="relative w-11 h-16 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden shadow-md">
                                                    {item.poster_path ? (
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                            alt={item.title || item.name || "Poster"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            {item.media_type === "movie" ? (
                                                                <Film className="w-5 h-5 text-gray-500" />
                                                            ) : (
                                                                <Tv className="w-5 h-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-base leading-tight truncate">
                                                        {item.title || item.name}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="inline-flex items-center gap-1 text-xs text-white/40">
                                                            {item.media_type === "movie" ? (
                                                                <Film className="w-3 h-3" />
                                                            ) : (
                                                                <Tv className="w-3 h-3" />
                                                            )}
                                                            {item.media_type === "movie" ? "Filme" : "Série"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Seta */}
                                                <ArrowRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Ver todos */}
                                <button
                                    onClick={() => handleSearch()}
                                    className="mt-4 w-full flex items-center justify-between gap-2 py-4 px-5 rounded-xl border border-dashed border-gray-700 text-white/50 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 active:scale-[0.99] transition-all duration-200 text-sm"
                                >
                                    <Search className="w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 text-center truncate">
                                        Ver todos os resultados para{" "}
                                        <strong className="font-semibold">"{query}"</strong>
                                    </span>
                                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
