"use client";

import { User } from "lucide-react";
import MovieCard from "./MovieCard";
import { motion } from "framer-motion";
import { useLoadingStore } from "@/store/loading-store";

interface SearchResultsProps {
  results: any[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  const { setLoading } = useLoadingStore();

  const handlePersonClick = (person: any) => {
    setLoading(true, "pessoa");
    // Aqui no futuro pode ir para a página da pessoa
    // router.push(`/pessoa/${person.id}`);
    window.scrollTo(0, 0);
  };

  if (results.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-14 text-center my-8">
        <p className="text-base font-semibold text-neutral-300">
          Nenhum resultado encontrado
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Tente buscar por outro título ou altere o filtro entre Filmes e Séries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {results.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: (index % 20) * 0.03 }}
            className="search-result-item"
            data-search-result
          >
            <MovieCard movie={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
