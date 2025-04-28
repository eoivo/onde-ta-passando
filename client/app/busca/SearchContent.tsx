"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { searchMulti } from "@/services/tmdb-api";
import SearchResults from "@/components/SearchResults";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams?.get("q") || "";
  const type = searchParams?.get("type") || "all";
  const genre = searchParams?.get("genre") || undefined;
  const year = searchParams?.get("year") || undefined;

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchMulti(query, type, genre, year);
        setResults(data);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query, type, genre, year]);

  if (!query) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-400">
          Digite algo para buscar filmes, séries ou pessoas
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-400">Buscando resultados...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 md:px-8 py-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Resultados para: {query}</h1>
        <SearchResults results={results} />
      </div>
    </main>
  );
}
