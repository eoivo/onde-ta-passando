"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Tv } from "lucide-react";
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
    <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-white/70">Buscando...</div>
      ) : (
        <ul className="py-2">
          {results.map((item) => (
            <li
              key={`${item.media_type}-${item.id}`}
              className="px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item.id, item.media_type)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-14 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
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
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    {item.title || item.name}
                  </span>
                  <span className="text-xs text-white/60">
                    {item.media_type === "movie" ? "Filme" : "Série"}
                  </span>
                </div>
              </div>
            </li>
          ))}
          <li className="border-t border-gray-700/50 mt-1 pt-1">
            <button
              onClick={() => {
                setGlobalLoading(true, "resultados");

                router.push(`/busca?q=${encodeURIComponent(query)}`);

                onItemClick();
              }}
              className="w-full text-center py-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Ver todos os resultados
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
