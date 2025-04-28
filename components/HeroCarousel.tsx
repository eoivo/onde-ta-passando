"use client";

import { useState, useEffect, useRef, TouchEvent } from "react";
import Hero from "./Hero";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  movies: any[];
  interval?: number;
}

export default function HeroCarousel({
  movies,
  interval = 8000,
}: HeroCarouselProps) {
  const [slideA, setSlideA] = useState({ index: 0, visible: true });
  const [slideB, setSlideB] = useState({ index: 0, visible: false });
  const [showControls, setShowControls] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSlide = slideA.visible ? "A" : "B";

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  if (!movies || movies.length === 0) {
    return null;
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (movies.length <= 1 || isTransitioning || trailerOpen) return;

    timerRef.current = setTimeout(() => {
      goToSlide((activeSlide === "A" ? slideA.index : slideB.index) + 1);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    slideA.index,
    slideB.index,
    slideA.visible,
    slideB.visible,
    isTransitioning,
    movies.length,
    trailerOpen,
  ]);

  const handleTrailerStateChange = (isOpen: boolean) => {
    setTrailerOpen(isOpen);
  };

  const goToSlide = (targetIndex: number) => {
    if (isTransitioning) return;

    const normalizedIndex =
      ((targetIndex % movies.length) + movies.length) % movies.length;

    const currentSlide = activeSlide === "A" ? slideA : slideB;

    if (normalizedIndex === currentSlide.index) return;

    setIsTransitioning(true);

    if (activeSlide === "A") {
      setSlideB({ index: normalizedIndex, visible: false });

      setTimeout(() => {
        setSlideA((prev) => ({ ...prev, visible: false }));
        setSlideB((prev) => ({ ...prev, visible: true }));

        setTimeout(() => {
          setIsTransitioning(false);
        }, 2000);
      }, 50);
    } else {
      setSlideA({ index: normalizedIndex, visible: false });

      setTimeout(() => {
        setSlideB((prev) => ({ ...prev, visible: false }));
        setSlideA((prev) => ({ ...prev, visible: true }));

        setTimeout(() => {
          setIsTransitioning(false);
        }, 2000);
      }, 50);
    }
  };

  const goToPrevious = () => {
    const currentIndex = activeSlide === "A" ? slideA.index : slideB.index;
    goToSlide(currentIndex - 1);
  };

  const goToNext = () => {
    const currentIndex = activeSlide === "A" ? slideA.index : slideB.index;
    goToSlide(currentIndex + 1);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative z-0"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative">
        <div
          className="absolute inset-0 w-full"
          style={{
            opacity: slideA.visible ? 1 : 0,
            transition: "opacity 2s ease-in-out",
            zIndex: slideA.visible ? 2 : 1,
          }}
        >
          <Hero
            movie={movies[slideA.index]}
            onTrailerStateChange={handleTrailerStateChange}
          />
        </div>

        <div
          className="absolute inset-0 w-full"
          style={{
            opacity: slideB.visible ? 1 : 0,
            transition: "opacity 2s ease-in-out",
            zIndex: slideB.visible ? 2 : 1,
          }}
        >
          <Hero
            movie={movies[slideB.index]}
            onTrailerStateChange={handleTrailerStateChange}
          />
        </div>

        <div className="relative invisible">
          <Hero movie={movies[0]} />
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/60 md:hidden">
        Deslize para navegar
      </div>

      {movies.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all duration-300 ${
              showControls ? "opacity-60" : "opacity-0"
            } hover:opacity-80 focus:opacity-80 hidden md:block`}
            aria-label="Título anterior"
            disabled={isTransitioning}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={goToNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all duration-300 ${
              showControls ? "opacity-60" : "opacity-0"
            } hover:opacity-80 focus:opacity-80 hidden md:block`}
            aria-label="Próximo título"
            disabled={isTransitioning}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}
    </div>
  );
}
