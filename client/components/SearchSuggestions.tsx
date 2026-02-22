"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Tv, Search } from "lucide-react";
import { useLoadingStore } from "@/store/loading-store";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
}

interface SearchSuggestionsProps {
  query: string;
  visible: boolean;
  onItemClick: () => void;
}

export default function SearchSuggestions({
  query,
  visible,
  onItemClick,
}: SearchSuggestionsProps) {
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoadingStore();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results.slice(0, 5));
        }
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (query) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!visible || query.length < 2 || results.length === 0) {
    return null;
  }

  const handleItemClick = (id: number, mediaType: "movie" | "tv") => {
    const path = mediaType === "movie" ? `/filme/${id}` : `/serie/${id}`;

    const title = mediaType === "movie" ? "filme" : "série";
    setGlobalLoading(true, title);

    router.push(path);

    onItemClick();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-gray-950/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
      {loading ? (
        <div className="p-6 flex flex-col items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Buscando</p>
        </div>
      ) : (
        <div className="p-2">
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Sugestões</p>
          </div>
          <ul className="space-y-1">
            {results.map((item) => (
              <li
                key={`${item.media_type}-${item.id}`}
                className="group px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between"
                onClick={() => handleItemClick(item.id, item.media_type)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-10 h-14 flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden border border-white/5 group-hover:border-red-500/30 transition-colors">
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt={item.title || item.name || "Poster"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.media_type === "movie" ? (
                          <Film className="w-5 h-5 text-white/20" />
                        ) : (
                          <Tv className="w-5 h-5 text-white/20" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors line-clamp-1">
                      {item.title || item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">
                        {item.media_type === "movie" ? (
                          <>
                            <Film className="w-2.5 h-2.5" />
                            Filme
                          </>
                        ) : (
                          <>
                            <Tv className="w-2.5 h-2.5" />
                            Série
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-white/5 px-1">
            <button
              onClick={() => {
                setGlobalLoading(true, "resultados");
                router.push(`/busca?q=${encodeURIComponent(query)}`);
                onItemClick();
              }}
              className="w-full group flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-red-600 transition-all duration-300"
            >
              <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider">
                Ver todos os resultados
              </span>
              <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Search className="w-3 h-3 text-white" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
