"use client";

import { useRef } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";
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
  useDragScroll(carouselRef);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;

      let scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      // Loop infinito
      if (direction === "right" && scrollLeft >= maxScroll - 10) scrollTo = 0;
      else if (direction === "left" && scrollLeft <= 10) scrollTo = maxScroll;

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
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        >
          {cast.map((person, index) => (
            <motion.div
              key={person.id}
              className="flex-shrink-0 w-[140px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="rounded-xl overflow-hidden cursor-pointer group/actor border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleActorClick(person.name)}
                  >
                    {person.profile_path ? (
                      <div className="relative h-[210px] w-[140px]">
                        <Image
                          src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                          alt={person.name}
                          width={140}
                          height={210}
                          quality={90}
                          className="object-cover w-full h-full group-hover/actor:scale-[1.03] transition-transform duration-300"
                        />
                        {/* Overlay com ícone de busca */}
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center opacity-0 group-hover/actor:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/65 border border-white/20 backdrop-blur-md rounded-full p-2.5">
                            <Search className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[210px] bg-white/[0.04] flex flex-col items-center justify-center hover:bg-white/[0.08] transition-colors">
                        <Search className="w-6 h-6 text-neutral-500 mb-2" />
                        <span className="text-neutral-500 text-xs text-center px-2">
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

              <div className="mt-2.5">
                <p
                  className="font-semibold text-[13.5px] text-neutral-100 hover:text-white transition-colors cursor-pointer leading-snug truncate"
                  onClick={() => handleActorClick(person.name)}
                >
                  {person.name}
                </p>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{person.character}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation buttons — centralizados exatamente em 105px (metade da foto de 210px) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-[105px] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-[105px] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
}
