"use client";

import { useState, useCallback } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrailerModal from "./TrailerModal";

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
      onTrailerStateChange?.(true);
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveVideo(null);
    onTrailerStateChange?.(false);
  }, [onTrailerStateChange]);

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
          className={`h-12 px-7 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold flex items-center justify-center gap-2.5 w-full transition-colors duration-200 cursor-pointer ${btnWidth}`}
          size="lg"
        >
          <Play className="h-4 w-4 fill-black" />
          Assistir trailer
        </Button>
      )}

      <TrailerModal
        videoKey={activeVideo}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}
