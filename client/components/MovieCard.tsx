"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Info, Star, X } from "lucide-react";
import { useLoadingStore } from "@/store/loading-store";
import { getMovieVideos, getTvVideos } from "@/services/tmdb-api";
import { Button } from "@/components/ui/button";

interface MovieCardProps {
  movie: any;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setLoading } = useLoadingStore();

  const mediaType = movie.media_type || "movie";
  const id = movie.id;
  const title = movie.title || movie.name;
  const posterPath = movie.poster_path;
  const backdropPath = movie.backdrop_path;
  const voteAverage = movie.vote_average;
  const overview = movie.overview;

  useEffect(() => {
    async function loadVideos() {
      try {
        const videoResults =
          mediaType === "tv"
            ? await getTvVideos(id.toString())
            : await getMovieVideos(id.toString());

        setVideos(videoResults);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
      }
    }

    if (isHovered && videos.length === 0) {
      loadVideos();
    }
  }, [id, mediaType, isHovered, videos.length]);

  if (!posterPath && !backdropPath) return null;

  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : `https://image.tmdb.org/t/p/w500${backdropPath}`;

  const handleNavigateToDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true, title);

    const targetUrl = `/${mediaType === "tv" ? "serie" : "filme"}/${id}`;
    router.push(targetUrl);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const sortedVideos = [...videos].sort((a, b) => {
    const typeOrder = { Trailer: 0, Teaser: 1, Clip: 2 };
    const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 3;
    const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 3;
    return typeA - typeB;
  });

  const trailer = sortedVideos.length > 0 ? sortedVideos[0] : null;

  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (trailer) {
      setActiveVideo(trailer.key);
      setIsTrailerOpen(true);
      document.body.style.overflow = "hidden";
    } else {
      handleNavigateToDetails(e);
    }
  };

  const handleCloseTrailer = () => {
    setIsTrailerOpen(false);
    setActiveVideo(null);
    document.body.style.overflow = "auto";
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleCloseTrailer();
    }
  };

  return (
    <>
      <motion.div
        className="relative aspect-[2/3] min-w-[150px] h-full rounded-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href={`/${mediaType === "tv" ? "serie" : "filme"}/${id}`}
          onClick={handleNavigateToDetails}
          className="cursor-pointer"
        >
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 ease-in-out"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />

          {isHovered && (
            <div
              className="absolute inset-0 bg-black/70 flex flex-col justify-between p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-medium line-clamp-2">{title}</div>

              {overview && (
                <div className="mt-2 mb-auto">
                  <p className="text-xs text-gray-300 line-clamp-4">
                    {overview}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm">{voteAverage?.toFixed(1)}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    className={`p-1.5 rounded-full ${
                      trailer
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    } transition-colors`}
                    onClick={handlePlayTrailer}
                    title={
                      trailer ? "Assistir trailer" : "Trailer não disponível"
                    }
                  >
                    <Play className="w-4 h-4 text-white fill-white" />
                  </button>
                  <button
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                    onClick={handleNavigateToDetails}
                    title="Ver detalhes"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </a>
      </motion.div>

      {isTrailerOpen && activeVideo && (
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
              onClick={handleCloseTrailer}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
