"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchMulti, searchMovies, searchTVShows } from "@/services/tmdb-api";
import SearchResults from "@/components/SearchResults";
import { Search, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { sortAndFilterResults } from "@/utils/media-utils";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const isMobile = useMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams?.get("q") || "";
  const page = parseInt(searchParams?.get("page") || "1");
  const type = searchParams?.get("type") || "all";
  const genre = searchParams?.get("genre") || undefined;
  const year = searchParams?.get("year") || undefined;

  // Sincroniza o input com a query da URL
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Busca inicial e quando a página muda
  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        setLoading(false);
        setTotalPages(0);
        return;
      }

      setLoading(true);
      try {
        let mergedResults: any[] = [];
        let maxPages = 0;

        if (type === "all") {
          // Busca filmes e séries em paralelo para preencher a página (aprox 40 itens)
          const [movieData, tvData] = await Promise.all([
            searchMovies(query, page, year, genre),
            searchTVShows(query, page, year, genre)
          ]);

          const movies = (movieData.results || []).map((m: any) => ({ ...m, media_type: "movie" }));
          const tvShows = (tvData.results || []).map((t: any) => ({ ...t, media_type: "tv" }));

          mergedResults = [...movies, ...tvShows];
          maxPages = Math.max(movieData.total_pages || 0, tvData.total_pages || 0);
        } else {
          const data = await searchMulti(query, type, genre, year, page);
          mergedResults = data.results || [];
          maxPages = data.total_pages || 0;
        }

        // Filtro e Ordenação Inteligente de Qualidade
        const filteredResults = sortAndFilterResults(mergedResults);

        setResults(filteredResults);
        setTotalPages(Math.min(maxPages, 500));
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
        setResults([]);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    fetchResults();
  }, [query, page, type, genre, year]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", newPage.toString());
    router.push(`/busca?${params.toString()}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      router.push(`/busca?q=${encodeURIComponent(inputValue.trim())}&page=1`);
    }
  };

  // Lógica para gerar os números das páginas visíveis
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = isMobile ? 3 : 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Estado: sem query (entrada direta pela URL)
  if (!query) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 pt-36 pb-16">
        <div className="w-full max-w-xl">
          {/* Ícone decorativo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <Search className="h-7 w-7 text-red-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">
            O que você quer assistir?
          </h1>
          <p className="text-center text-white/40 text-sm mb-8">
            Busque filmes, séries e muito mais
          </p>

          {/* Campo de busca inline */}
          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white/5 border border-gray-700 focus-within:border-red-500/60 rounded-2xl overflow-hidden transition-colors duration-300"
          >
            <Search className="absolute left-4 h-5 w-5 text-white/30 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Ex: Breaking Bad, Duna, Nolan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-white pl-12 pr-12 py-4 focus:outline-none placeholder-white/30 text-base"
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  inputRef.current?.focus();
                }}
                className="absolute right-14 text-white/40 hover:text-white/70 transition-colors"
                aria-label="Limpar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-3 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 rounded-xl px-3 py-2"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-white/40 text-sm">Buscando resultados...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        {/* Barra de busca inline na página de resultados */}
        <form
          onSubmit={handleSearch}
          className="relative flex items-center mb-8 bg-white/5 border border-gray-700 focus-within:border-red-500/60 rounded-2xl overflow-hidden transition-colors duration-300 max-w-lg"
        >
          <Search className="absolute left-4 h-5 w-5 text-white/30 pointer-events-none" />
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            placeholder="Buscar novamente..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent text-white pl-12 pr-12 py-3 focus:outline-none placeholder-white/30 text-base"
            autoComplete="off"
          />
          {inputValue !== query && inputValue && (
            <button
              type="submit"
              className="absolute right-3 bg-red-600 hover:bg-red-700 transition-all duration-200 rounded-xl px-3 py-1.5"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          )}
        </form>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 break-words text-white">
          Resultados para:{" "}
          <span className="text-red-500 italic">"{query}"</span>
        </h1>

        <SearchResults results={results} />

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-12 pb-12">
            <Pagination>
              <PaginationContent className="flex-wrap justify-center gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-red-600 hover:text-white transition-colors bg-white/5 border-white/10"}
                  />
                </PaginationItem>

                {!isMobile && page > 3 && (
                  <>
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }} className="bg-white/5 border-white/10 hover:bg-red-600 transition-colors">1</PaginationLink>
                    </PaginationItem>
                    <PaginationEllipsis />
                  </>
                )}

                {getVisiblePages().map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                      className={p === page ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 hover:bg-red-600 hover:text-white transition-colors"}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {!isMobile && page < totalPages - 2 && (
                  <>
                    <PaginationEllipsis />
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }} className="bg-white/5 border-white/10 hover:bg-red-600 transition-colors">{totalPages}</PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-red-600 hover:text-white transition-colors bg-white/5 border-white/10"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </main>
  );
}
