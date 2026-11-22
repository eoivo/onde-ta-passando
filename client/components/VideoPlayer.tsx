"use client";

import { useState, useRef, useEffect } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videos: any[];
  onTrailerStateChange?: (isOpen: boolean) => void;
  btnWidth?: string;
  variant?: "default" | "capsule-quiet";
}

export default function VideoPlayer({
  videos,
  onTrailerStateChange,
  btnWidth = "md:w-[170px]",
  variant = "default",
}: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const sortedVideos = [...videos].sort((a, b) => {
    const typeOrder = { Trailer: 0, Teaser: 1, Clip: 2 };
    const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 3;
    const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 3;
    return typeA - typeB;
  });

  const trailer = sortedVideos.length > 0 ? sortedVideos[0] : null;

  const handlePlay = () => {
    if (trailer) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setActiveVideo(trailer.key);
        setIsOpen(true);
        document.body.style.overflow = "hidden";
        if (onTrailerStateChange) {
          onTrailerStateChange(true);
        }
      }, 300);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveVideo(null);
    document.body.style.overflow = "auto";
    if (onTrailerStateChange) {
      onTrailerStateChange(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  if (!trailer) return null;

  return (
    <>
      {variant === "capsule-quiet" ? (
        <button
          type="button"
          onClick={handlePlay}
          className="h-11 px-5 rounded-full bg-transparent hover:bg-white/10 text-neutral-200 hover:text-white text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 whitespace-nowrap cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 fill-current text-neutral-300" />
          <span>Trailer</span>
        </button>
      ) : (
        <Button
          onClick={handlePlay}
          className={`h-12 px-7 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold flex items-center justify-center gap-2.5 w-full transition-colors duration-200 ${btnWidth}`}
          size="lg"
        >
          <Play className="h-4 w-4 fill-black" />
          Assistir trailer
        </Button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl aspect-video mx-auto"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar trailer"
              className="absolute -top-11 right-0 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
