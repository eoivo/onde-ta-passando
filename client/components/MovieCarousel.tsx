"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDragScroll } from "@/hooks/useDragScroll";
import MovieCard from "./MovieCard";

interface MovieCarouselProps {
  title: string;
  movies: any[];
  priority?: boolean;
}

const INITIAL_RENDER_COUNT = 12;

export default function MovieCarousel({
  title,
  movies,
  priority = false,
}: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(movies.length <= INITIAL_RENDER_COUNT);
  useDragScroll(carouselRef);

  const ensureExpanded = () => {
    if (!expanded) setExpanded(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (!expanded) {
      flushSync(() => setExpanded(true));
    }

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

  const visibleMovies = expanded ? movies : movies.slice(0, INITIAL_RENDER_COUNT);

  return (
    <div
      className={title ? "space-y-2 py-4" : ""}
      onMouseEnter={ensureExpanded}
      onTouchStart={ensureExpanded}
      onFocus={ensureExpanded}
    >
      {title && (
        <h2 className="text-2xl md:text-3xl font-normal font-bebas tracking-wider uppercase">
          {title}
        </h2>
      )}

      <div className="relative group">
        <div
          ref={carouselRef}
          onScroll={ensureExpanded}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-4"
        >
          {visibleMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-[150px] md:w-[180px]"
            >
              <MovieCard
                movie={movie}
                index={index}
                priority={priority && index < 6}
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons — descontam metade do pb-4 (8px) para cravar no centro exato do pôster */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-[calc(50%-8px)] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-[calc(50%-8px)] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
