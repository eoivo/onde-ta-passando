"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, ArrowRight, Star } from "lucide-react";
import { useLoadingStore } from "@/store/loading-store";
import { getMovieVideos, getTvVideos } from "@/services/tmdb-api";
import TrailerModal from "./TrailerModal";

interface MovieCardProps {
  movie: any;
  index?: number;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const router = useRouter();
  const { setLoading } = useLoadingStore();

  const mediaType = movie.media_type || "movie";
  const id = movie.id;
  const title = movie.title || movie.name;
  const posterPath = movie.poster_path;
  const backdropPath = movie.backdrop_path;
  const voteAverage = movie.vote_average;
  const overview = movie.overview;
  const releaseYear = (() => {
    const raw = movie.release_date || movie.first_air_date;
    if (!raw) return null;
    const y = new Date(raw).getFullYear();
    return isNaN(y) ? null : y;
  })();

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
      setIsHovered(false);
      setActiveVideo(trailer.key);
      setIsTrailerOpen(true);
    } else {
      handleNavigateToDetails(e);
    }
  };

  const handleCloseTrailer = useCallback(() => {
    setIsTrailerOpen(false);
    setActiveVideo(null);
  }, []);

  return (
    <>
      <div
        className="group/card relative aspect-[2/3] min-w-[150px] h-full rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors duration-200 bg-neutral-950"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href={`/${mediaType === "tv" ? "serie" : "filme"}/${id}`}
          onClick={handleNavigateToDetails}
          className="cursor-pointer relative block w-full h-full"
        >
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            quality={85}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            sizes="(max-width: 640px) 165px, 210px"
            className="object-cover transition-transform duration-300 ease-out group-hover/card:scale-105"
          />

          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/95 backdrop-blur-[2px] flex flex-col justify-between p-3.5">
              <div>
                <div className="text-[14px] font-semibold text-white leading-snug tracking-tight line-clamp-2">
                  {title}
                </div>

                {overview && (
                  <p className="mt-1.5 text-[11.5px] text-neutral-200/85 leading-[1.45] line-clamp-4">
                    {overview}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                  {typeof voteAverage === "number" && voteAverage > 0 && (
                    <span className="inline-flex items-center gap-1 text-white font-semibold">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {voteAverage.toFixed(1)}
                    </span>
                  )}
                  {typeof voteAverage === "number" && voteAverage > 0 && releaseYear && (
                    <span className="text-neutral-600">•</span>
                  )}
                  {releaseYear && <span>{releaseYear}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={`h-[30px] px-3 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      trailer
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-white/10 text-neutral-400 hover:bg-white/15 hover:text-white border border-white/10"
                    }`}
                    onClick={handlePlayTrailer}
                    title={
                      trailer ? "Assistir trailer" : "Ver detalhes"
                    }
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Trailer</span>
                  </button>
                  <button
                    type="button"
                    className="w-[30px] h-[30px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 text-white grid place-items-center transition-colors"
                    onClick={handleNavigateToDetails}
                    title="Ver detalhes"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </a>
      </div>

      <TrailerModal
        videoKey={activeVideo}
        isOpen={isTrailerOpen}
        onClose={handleCloseTrailer}
      />
    </>
  );
}
