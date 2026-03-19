"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UnifiedCollection } from "@/services/collections-api";
import MovieCard from "./MovieCard";
import { motion } from "framer-motion";
import { Play, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface CollectionsGridProps {
  collections: UnifiedCollection[];
  configs: Array<{ id: number; name: string; description?: string }>;
}

export default function CollectionsGrid({
  collections,
  configs,
}: CollectionsGridProps) {
  const router = useRouter();

  // Filtrar coleções válidas
  const validCollections = collections.filter(
    (c) => c.movies.length > 0
  );

  // Estado para a coleção destacada (definido apenas no cliente)
  const [featuredCollection, setFeaturedCollection] = useState<UnifiedCollection | null>(
    validCollections.length > 0 ? validCollections[0] : null
  );

  // Função para obter o nome correto da coleção (usa config se disponível)
  const getCollectionName = (collection: UnifiedCollection) => {
    const config = configs.find((c) => c.id === collection.id);
    return config?.name || collection.name;
  };

  // Selecionar uma coleção aleatória apenas no cliente após hidratação
  useEffect(() => {
    if (validCollections.length > 0) {
      const randomIndex = Math.floor(Math.random() * validCollections.length);
      setFeaturedCollection(validCollections[randomIndex]);
    }
  }, []); // Executa apenas uma vez após montagem

  const otherCollections = validCollections
    .filter((c) => c.id !== featuredCollection?.id)
    .slice(0, 5);

  if (!featuredCollection) return null;

  const featuredConfig = configs.find((c) => c.id === featuredCollection.id);
  const backdropUrl = featuredCollection.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${featuredCollection.backdrop_path}`
    : featuredCollection.movies[0]?.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${featuredCollection.movies[0].backdrop_path}`
      : null;

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-red-500" />
        <h2 className="text-3xl md:text-5xl font-normal font-bebas tracking-wide bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text uppercase">
          Universos & Coleções
        </h2>
      </div>

      {/* Coleção em Destaque */}
      {featuredCollection && (
        <FeaturedCollectionCard
          collection={featuredCollection}
          backdropUrl={backdropUrl}
          router={router}
          getCollectionName={() => getCollectionName(featuredCollection)}
        />
      )}

      {/* Outras Coleções em Grid */}
      {otherCollections.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-2xl md:text-3xl font-normal font-bebas tracking-wide bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text uppercase">
              Explore Outras Coleções
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherCollections.map((collection) => {
              const config = configs.find((c) => c.id === collection.id);
              const posterUrl = collection.poster_path
                ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
                : collection.movies[0]?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${collection.movies[0].poster_path}`
                  : null;

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => router.push(`/colecao/${collection.id}`)}
                >
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-500 text-sm text-center px-2">
                        {collection.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h4 className="text-white font-normal font-bebas text-lg mb-1 uppercase tracking-tight">
                      {getCollectionName(collection)}
                    </h4>
                    <p className="text-gray-300 text-xs">
                      {collection.movies.length} filmes
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// Componente para o card destacado com carrossel interno
function FeaturedCollectionCard({
  collection,
  backdropUrl,
  router,
  getCollectionName,
}: {
  collection: UnifiedCollection;
  backdropUrl: string | null;
  router: any;
  getCollectionName: () => string;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-lg overflow-hidden"
    >
      {backdropUrl && (
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt={collection.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60" />
        </div>
      )}

      <div className="relative z-10 p-6 md:p-12 pb-6">
        {/* Header da Coleção */}
        <div className="mb-6">
          <h3 className="text-4xl md:text-6xl font-normal font-bebas mb-3 text-white uppercase tracking-tighter">
            {getCollectionName()}
          </h3>
          {collection.overview && (
            <p className="text-gray-200 text-sm md:text-base mb-4 max-w-2xl line-clamp-2">
              {collection.overview}
            </p>
          )}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {collection.movies.length} filmes
            </span>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push(`/colecao/${collection.id}`)}
            >
              <Play className="w-4 h-4 mr-2" />
              Explorar Coleção
            </Button>
          </div>
        </div>

        {/* Carrossel de Filmes dentro do Card */}
        {collection.movies.length > 0 && (
          <div className="relative group">
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              {collection.movies.slice(0, 20).map((movie, index) => (
                <div
                  key={movie.id}
                  className="flex-shrink-0 w-[120px] md:w-[140px] snap-start"
                >
                  <MovieCard movie={movie} index={index} />
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            {collection.movies.length > 5 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("left");
                  }}
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll("right");
                  }}
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

