"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchMulti, searchMovies, searchTVShows } from "@/services/tmdb-api";
import SearchResults from "@/components/SearchResults";
import { Search, X, ChevronLeft, ChevronRight, Loader2, Film, Tv } from "lucide-react";
import { sortAndFilterResults } from "@/utils/media-utils";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams?.get("q") || "";
  const page = parseInt(searchParams?.get("page") || "1");
  const type = searchParams?.get("type") || "all";
  const genre = searchParams?.get("genre") || undefined;
  const year = searchParams?.get("year") || undefined;

  useEffect(() => {
    setInputValue(query);
  }, [query]);

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
          mergedResults = (data.results || []).map((item: any) => ({
            ...item,
            media_type: item.media_type || (type === "movies" ? "movie" : type === "tv" ? "tv" : undefined),
          }));
          maxPages = data.total_pages || 0;
        }

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

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (newType === "all") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    params.set("page", "1");
    router.push(`/busca?${params.toString()}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      router.push(`/busca?q=${encodeURIComponent(inputValue.trim())}&page=1`);
    }
  };

  // Estado: sem query (entrada direta pela URL)
  if (!query) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 pt-36 pb-16">
        <div className="w-full max-w-xl text-center space-y-6">
          <div className="space-y-2">
            <h1 className="font-bebas text-4xl md:text-6xl text-white uppercase tracking-wider leading-none">
              O que você quer <span className="text-red-600">assistir?</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-base">
              Busque filmes e séries para descobrir onde estão disponíveis no streaming.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white/[0.04] border border-white/10 focus-within:border-red-500/60 rounded-2xl overflow-hidden backdrop-blur-xl transition-colors duration-200 shadow-2xl"
          >
            <Search className="absolute left-4 h-5 w-5 text-neutral-500 pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Ex: Breaking Bad, Duna, Interestelar..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-white pl-12 pr-11 py-4 focus:outline-none placeholder-neutral-500 text-sm md:text-base"
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  inputRef.current?.focus();
                }}
                className="absolute right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                aria-label="Limpar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-12 pt-28 pb-20">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Cabeçalho e barra de busca refinada */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-bebas text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wider leading-none break-words">
                Resultados para <span className="text-red-500">&ldquo;{query}&rdquo;</span>
              </h1>
              {!loading && results.length > 0 && (
                <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                  {results.length} nesta página
                </span>
              )}
            </div>

            {/* Filtros rápidos de tipo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("all")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  type === "all"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("movies")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  type === "movies"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Filmes
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("tv")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  type === "tv"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                Séries
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="relative flex items-center bg-white/[0.04] border border-white/10 focus-within:border-red-500/60 rounded-2xl overflow-hidden transition-colors duration-200 w-full lg:w-[360px]"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-neutral-500 pointer-events-none z-10" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Nova busca..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-11 bg-transparent text-white pl-10 pr-10 focus:outline-none placeholder-neutral-500 text-sm"
              autoComplete="off"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-3.5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                aria-label="Limpar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-neutral-400 text-sm font-medium">Buscando títulos...</p>
          </div>
        ) : (
          <>
            <SearchResults results={results} />

            {/* Paginação em Pílulas Dark Glass */}
            {totalPages > 1 && results.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-10 border-t border-white/5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <span className="text-white font-bold">{page}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
