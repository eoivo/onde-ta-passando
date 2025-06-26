"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CastCarouselProps {
  cast: any[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
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

  // Função para buscar o nome do ator no Google
  const handleActorClick = (actorName: string) => {
    const searchQuery = encodeURIComponent(actorName);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <div className="relative group">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-4"
        >
          {cast.map((person, index) => (
            <motion.div
              key={person.id}
              className="flex-shrink-0 w-[140px] snap-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="rounded-lg overflow-hidden cursor-pointer group/actor hover:scale-105 transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleActorClick(person.name)}
                  >
                    {person.profile_path ? (
                      <div className="relative">
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          width={140}
                          height={210}
                          className="object-cover aspect-[2/3]"
                        />
                        {/* Overlay com ícone de busca */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/actor:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Search className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[210px] bg-gray-800 flex flex-col items-center justify-center hover:bg-gray-700 transition-colors">
                        <Search className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-400 text-xs text-center px-2">
                          Buscar no Google
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para buscar {person.name} no Google</p>
                </TooltipContent>
              </Tooltip>

              <div className="mt-2">
                <p
                  className="font-medium text-sm hover:text-primary transition-colors cursor-pointer"
                  onClick={() => handleActorClick(person.name)}
                >
                  {person.name}
                </p>
                <p className="text-xs text-gray-400">{person.character}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/3 -translate-y-1/2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/3 -translate-y-1/2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </TooltipProvider>
  );
}
