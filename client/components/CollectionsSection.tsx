"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieCarousel from "./MovieCarousel";
import { UnifiedCollection } from "@/services/collections-api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CollectionsSectionProps {
  collections: UnifiedCollection[];
  configs: Array<{ id: number; name: string; description?: string }>;
}

export default function CollectionsSection({
  collections,
  configs,
}: CollectionsSectionProps) {
  const [activeTab, setActiveTab] = useState(configs[0]?.id.toString() || "");

  // Filtrar apenas coleções que têm filmes
  const validCollections = collections.filter(
    (collection) => collection.movies.length > 0
  );

  if (validCollections.length === 0) return null;

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
          Universos & Coleções
        </h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full bg-gray-900/50 p-1.5 h-auto flex-wrap gap-2 justify-start overflow-x-auto scrollbar-hide">
          {validCollections.map((collection) => {
            const config = configs.find((c) => c.id === collection.id);
            return (
              <TabsTrigger
                key={collection.id}
                value={collection.id.toString()}
                className="px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-700 transition-all whitespace-nowrap"
              >
                {collection.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          {validCollections.map((collection) => (
            <TabsContent
              key={collection.id}
              value={collection.id.toString()}
              className="mt-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {collection.overview && (
                  <p className="text-gray-400 text-sm mb-4 max-w-3xl">
                    {collection.overview}
                  </p>
                )}
                <MovieCarousel
                  title=""
                  movies={collection.movies}
                />
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

