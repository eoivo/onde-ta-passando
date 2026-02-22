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
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xl text-gray-400">Nenhum resultado encontrado</p>
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
