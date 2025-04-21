"use client";

import { useState, useRef, useEffect } from "react";
import { Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videos: any[];
}

export default function VideoPlayer({ videos }: VideoPlayerProps) {
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
      setActiveVideo(trailer.key);
      setIsOpen(true);
      document.body.style.overflow = "hidden";
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveVideo(null);
    document.body.style.overflow = "auto";
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
      <Button
        onClick={handlePlay}
        className="bg-white text-black hover:bg-white/90 flex items-center gap-2"
        size="lg"
      >
        <Play className="h-5 w-5 fill-black" />
        Assistir trailer
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl aspect-video mx-auto"
          >
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded"
            ></iframe>

            <Button
              variant="default"
              size="icon"
              className="absolute -top-12 -right-1 md:-top-12 md:-right-12 bg-red-600 hover:bg-red-700 rounded-full shadow-lg z-10"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
