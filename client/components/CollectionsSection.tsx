"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Film, Globe, Clapperboard, ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UnifiedCollection,
  CollectionCategory,
} from "@/services/collections-api";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface CategorySection {
  label: string;
  category: CollectionCategory;
  icon: ReactNode;
  subtitle: string;
  collections: UnifiedCollection[];
}

interface CollectionsSectionProps {
  sagas: UnifiedCollection[];
  universes: UnifiedCollection[];
  studios: UnifiedCollection[];
}

// ---------------------------------------------------------------------------
// Componente raiz
// ---------------------------------------------------------------------------

export default function CollectionsSection({
  sagas,
  universes,
  studios,
}: CollectionsSectionProps) {
  const sections: CategorySection[] = [
    {
      label: "Sagas",
      category: "saga",
      icon: <Film className="w-5 h-5 text-red-500" />,
      subtitle: "Sequências épicas em ordem cronológica",
      collections: sagas,
    },
    {
      label: "Universos",
      category: "universo",
      icon: <Globe className="w-5 h-5 text-red-500" />,
      subtitle: "Mundos compartilhados com múltiplas franquias",
      collections: universes,
    },
    {
      label: "Estúdios",
      category: "estudio",
      icon: <Clapperboard className="w-5 h-5 text-red-500" />,
      subtitle: "Filmografias das produtoras mais icônicas",
      collections: studios,
    },
  ];

  const hasContent = sections.some((s) => s.collections.length > 0);
  if (!hasContent) return null;

  return (
    <div className="space-y-10">
      {sections.map(
        (section) =>
          section.collections.length > 0 && (
            <CategoryRow key={section.category} section={section} />
          )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seção por categoria
// ---------------------------------------------------------------------------

function CategoryRow({ section }: { section: CategorySection }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Controlar visibilidade das setas com base no scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-4 group/row">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {section.icon}
            <h2 className="text-3xl md:text-4xl font-normal font-bebas tracking-wide bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text uppercase">
              {section.label}
            </h2>
          </div>
          <p className="text-sm text-gray-500">{section.subtitle}</p>
        </div>
      </div>

      <div className="relative">
        {section.category === "universo" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {section.collections.slice(0, 2).map((collection) => (
              <UniverseCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <>
            {/* Setas Flutuantes (Hover Desktop) - Estilo Padronizado */}
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("left")}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity ml-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("right")}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity mr-2"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:-mx-8 md:px-8"
            >
              {section.collections.map((collection, i) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  index={i}
                  category={section.category}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card individual (landscape 16:9)
// ---------------------------------------------------------------------------

function CollectionCard({
  collection,
  index,
  category,
}: {
  collection: UnifiedCollection;
  index: number;
  category: CollectionCategory;
}) {
  const router = useRouter();

  const backdropUrl = collection.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${collection.backdrop_path}`
    : collection.movies[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${collection.movies[0].backdrop_path}`
    : null;

  const countLabel = category === "universo" ? "títulos" : "filmes";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={() => router.push(`/colecao/${category}/${collection.id}`)}
      className="flex-shrink-0 w-[260px] md:w-[310px] aspect-video rounded-xl overflow-hidden relative cursor-pointer group shadow-lg bg-black transition-all duration-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]"
    >
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={collection.name}
          fill
          quality={90}
          sizes="(max-width: 768px) 500px, 600px"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <span className="text-gray-600 text-sm text-center px-4 font-bebas tracking-widest uppercase">
            {collection.name}
          </span>
        </div>
      )}

      {/* Overlays expandidos para evitar bleeding */}
      <div className="absolute -inset-x-px -bottom-px h-full bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end z-20">
        <h3 className="font-normal font-bebas text-xl md:text-2xl uppercase tracking-wide text-white leading-tight line-clamp-1 transform transition-transform duration-300 group-hover:-translate-y-1">
          {collection.name}
        </h3>
        <div className="flex items-center justify-between mt-1 transform transition-transform duration-300 group-hover:-translate-y-1">
          <span className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-tighter">
            {collection.total_results || collection.movies.length} {countLabel}
          </span>
          <div className="flex items-center gap-0.5 text-red-500 text-[10px] md:text-xs font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300">
            Explorar
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Border Mask & Hover Ring */}
      <div className="absolute inset-0 rounded-xl ring-[2px] ring-inset ring-black z-10" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-red-600/40 transition-all duration-300 pointer-events-none z-30" />
    </motion.div>
  );
}

/**
 * Card de UNIVERSO: Foco em impacto visual e branding (Marvel vs DC)
 */
function UniverseCard({ collection }: { collection: UnifiedCollection }) {
  const router = useRouter();
  const isMarvel =
    collection.name.toLowerCase().includes("marvel") || collection.id === 180547;

  // Temas visuais
  const theme = isMarvel
    ? {
        name: "Multiverso",
        color: "from-red-600/60",
        ring: "group-hover:ring-red-500/50",
        glow: "group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]",
        badge: "bg-red-600",
      }
    : {
        name: "Lendário",
        color: "from-blue-600/60",
        ring: "group-hover:ring-blue-500/50",
        glow: "group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]",
        badge: "bg-blue-700",
      };

  const backdropUrl = collection.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${collection.backdrop_path}`
    : collection.movies[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${collection.movies[0].backdrop_path}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={() => router.push(`/colecao/universo/${collection.id}`)}
      className={`relative aspect-[21/9] md:aspect-[16/7] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500 bg-black ${theme.glow}`}
    >
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center p-8">
          <span className="text-gray-600 text-lg uppercase font-bebas tracking-widest text-center">
            {collection.name}
          </span>
        </div>
      )}

      {/* Overlay: Branding Accent (expandido para evitar bleeding) */}
      <div
        className={`absolute -inset-px bg-gradient-to-r ${theme.color} via-transparent to-transparent opacity-30 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-50`}
      />

      {/* Gradient Darkener (expandido no fundo) */}
      <div className="absolute -inset-x-px -bottom-px h-full bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-20">
        <div className="flex items-center gap-3 mb-2 md:mb-3">
          <span
            className={`${theme.badge} text-[10px] px-2 py-0.5 rounded-full text-white font-bold uppercase tracking-tighter`}
          >
            {theme.name}
          </span>
        </div>

        <h3 className="font-bebas text-4xl md:text-6xl text-white uppercase tracking-wider leading-none drop-shadow-lg">
          {collection.name}
        </h3>

        <div className="flex items-center gap-2 mt-4 text-white/50 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          EXPLORAR FRANQUIAS E LINHAS DO TEMPO
          <ChevronRight className="w-3 h-3 text-red-500" />
        </div>
      </div>

      {/* Border Mask: Isso resolve o problema de bleeding nas bordas arredondadas */}
      <div
        className={`absolute inset-0 rounded-2xl ring-[2px] ring-inset ring-black z-10 transition-all duration-500 ${theme.ring}`}
      />
    </motion.div>
  );
}
