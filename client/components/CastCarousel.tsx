"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

  return (
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
            <div className="rounded-lg overflow-hidden">
              {person.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  width={140}
                  height={210}
                  className="object-cover aspect-[2/3]"
                />
              ) : (
                <div className="w-full h-[210px] bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="font-medium text-sm">{person.name}</p>
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
  );
}
