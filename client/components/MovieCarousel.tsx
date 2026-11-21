"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDragScroll } from "@/hooks/useDragScroll";
import MovieCard from "./MovieCard";

interface MovieCarouselProps {
  title: string;
  movies: any[];
}

export default function MovieCarousel({ title, movies }: MovieCarouselProps) {
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

      // Loop infinito: volta ao início/fim ao chegar na extremidade
      if (direction === "right" && scrollLeft >= maxScroll - 10) scrollTo = 0;
      else if (direction === "left" && scrollLeft <= 10) scrollTo = maxScroll;

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-2 py-4">
      <h2 className="text-2xl md:text-3xl font-normal font-bebas tracking-wider uppercase">{title}</h2>

      <div className="relative group">
        <div
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-4"
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-[150px] md:w-[180px]"
            >
              <MovieCard movie={movie} index={index} />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
