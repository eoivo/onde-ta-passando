"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "./VideoPlayer";
import { useEffect, useState } from "react";
import {
  getMovieVideos,
  getTvVideos,
  getMovieDetails,
  getTvDetails,
} from "@/services/tmdb-api";
import { motion } from "framer-motion";

interface HeroProps {
  movie: any;
  onTrailerStateChange?: (isOpen: boolean) => void;
  priority?: boolean;
}

export default function Hero({ movie, onTrailerStateChange, priority = false }: HeroProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    async function fetchHeroData() {
      if (!movie) return;

      const mediaType = movie.media_type || "movie";
      try {
        const [videosData, detailsData] = await Promise.all([
          mediaType === "tv"
            ? getTvVideos(movie.id.toString())
            : getMovieVideos(movie.id.toString()),
          mediaType === "tv"
            ? getTvDetails(movie.id.toString())
            : getMovieDetails(movie.id.toString()),
        ]);

        setVideos(videosData);
        setDetails(detailsData);
      } catch (error) {
        console.error("Erro ao carregar dados da hero:", error);
      }
    }

    fetchHeroData();
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="relative h-auto md:h-[85vh] w-full overflow-hidden">
      {/* Backdrop image with Ken Burns effect */}
      <motion.div
        animate={{
          scale: [1, 1.15],
          x: [0, -20],
          y: [0, -10],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title || movie.name}
          fill
          priority={priority}
          unoptimized={true}
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="relative md:absolute inset-0 z-20 flex flex-col justify-start md:justify-center pt-28 pb-14 md:pt-32 md:pb-16">
        <div className="max-w-2xl w-full px-4 md:px-8 md:ml-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight uppercase">
            {movie.title || movie.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <span>
              {(() => {
                const dateStr = movie.release_date || movie.first_air_date;
                if (!dateStr) return null;
                const year = new Date(dateStr).getFullYear();
                return isNaN(year) ? null : year;
              })()}
            </span>
            <span>&bull;</span>
            <span>
              {movie.media_type === "tv" ? "Série" : "Filme"}
            </span>
            {details && (
              <>
                <span>&bull;</span>
                <span>
                  {movie.media_type === "tv"
                    ? details.number_of_seasons === 1
                      ? "1 Temporada"
                      : `${details.number_of_seasons} Temporadas`
                    : details.runtime
                      ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}min`
                      : null
                  }
                </span>
                {details.genres && details.genres.length > 0 && (
                  <>
                    <span>&bull;</span>
                    <span className="text-gray-400 font-bold">
                      {details.genres[0].name}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-4 pt-1">
            {movie.overview}
          </p>

          <div className="pt-1">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-neutral-950/65 backdrop-blur-xl border border-white/15 max-w-full">
              <Link
                href={`/${movie.media_type === "tv" ? "serie" : "filme"}/${movie.id}`}
                className="h-11 px-5 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold inline-flex items-center gap-2 transition-colors duration-200 whitespace-nowrap"
              >
                <span>Onde assistir</span>
                <ArrowRight className="w-4 h-4 text-neutral-700" />
              </Link>

              {videos.length > 0 && (
                <VideoPlayer
                  videos={videos}
                  onTrailerStateChange={onTrailerStateChange}
                  variant="capsule-quiet"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
