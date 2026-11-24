"use client";

import { useState, useEffect, useRef, TouchEvent, MouseEvent } from "react";
import Hero from "./Hero";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  movies: any[];
  interval?: number;
}

export default function HeroCarousel({
  movies,
  interval = 10000,
}: HeroCarouselProps) {
  const [slideA, setSlideA] = useState({ index: 0, visible: true });
  const [slideB, setSlideB] = useState<{ index: number; visible: boolean } | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSlide = slideA.visible ? "A" : "B";
  const activeIndex = activeSlide === "A" ? slideA.index : (slideB?.index ?? 0);

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
      goToSlide(activeIndex + 1);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    activeIndex,
    slideA.visible,
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

    if (normalizedIndex === activeIndex) return;

    setIsTransitioning(true);

    if (activeSlide === "A") {
      setSlideB({ index: normalizedIndex, visible: false });

      setTimeout(() => {
        setSlideA((prev) => ({ ...prev, visible: false }));
        setSlideB({ index: normalizedIndex, visible: true });

        setTimeout(() => {
          setIsTransitioning(false);
        }, 2000);
      }, 50);
    } else {
      setSlideA({ index: normalizedIndex, visible: false });

      setTimeout(() => {
        setSlideB((prev) => (prev ? { ...prev, visible: false } : null));
        setSlideA({ index: normalizedIndex, visible: true });

        setTimeout(() => {
          setIsTransitioning(false);
        }, 2000);
      }, 50);
    }
  };

  const goToPrevious = () => {
    goToSlide(activeIndex - 1);
  };

  const goToNext = () => {
    goToSlide(activeIndex + 1);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const mouseStartX = useRef<number | null>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    if (mouseStartX.current === null) return;
    const distance = mouseStartX.current - e.clientX;
    mouseStartX.current = null;
    if (Math.abs(distance) > 80) {
      if (distance > 0) goToNext();
      else goToPrevious();
    }
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
      onMouseLeave={() => {
        setShowControls(false);
        mouseStartX.current = null;
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative">
        <div
          className={slideA.visible ? "relative w-full" : "absolute inset-0 w-full pointer-events-none"}
          style={{
            opacity: slideA.visible ? 1 : 0,
            transition: "opacity 2s ease-in-out",
            zIndex: slideA.visible ? 2 : 1,
          }}
        >
          <Hero
            movie={movies[slideA.index]}
            onTrailerStateChange={handleTrailerStateChange}
            priority={slideA.index === 0}
            isActive={slideA.visible}
          />
        </div>

        {slideB !== null && (
          <div
            className={slideB.visible ? "relative w-full" : "absolute inset-0 w-full pointer-events-none"}
            style={{
              opacity: slideB.visible ? 1 : 0,
              transition: "opacity 2s ease-in-out",
              zIndex: slideB.visible ? 2 : 1,
            }}
          >
            <Hero
              movie={movies[slideB.index]}
              onTrailerStateChange={handleTrailerStateChange}
              priority={false}
              isActive={slideB.visible}
            />
          </div>
        )}
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
