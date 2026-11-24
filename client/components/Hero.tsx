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
  isActive?: boolean;
}

const heroDataCache = new Map<string, { videos: any[]; details: any }>();

export default function Hero({
  movie,
  onTrailerStateChange,
  priority = false,
  isActive = true,
}: HeroProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [details, setDetails] = useState<any>(null);
  const [anyTrailerOpen, setAnyTrailerOpen] = useState(false);

  useEffect(() => {
    const syncTrailerState = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      setAnyTrailerOpen(Boolean(custom.detail));
    };
    window.addEventListener("trailer-modal-change", syncTrailerState);
    return () => window.removeEventListener("trailer-modal-change", syncTrailerState);
  }, []);

  useEffect(() => {
    if (!movie || !isActive) return;

    const mediaType = movie.media_type || "movie";
    const cacheKey = `${mediaType}-${movie.id}`;
    const cached = heroDataCache.get(cacheKey);

    if (cached) {
      setVideos(cached.videos);
      setDetails(cached.details);
      return;
    }

    let cancelled = false;
    async function fetchHeroData() {
      try {
        const [videosData, detailsData] = await Promise.all([
          mediaType === "tv"
            ? getTvVideos(movie.id.toString())
            : getMovieVideos(movie.id.toString()),
          mediaType === "tv"
            ? getTvDetails(movie.id.toString())
            : getMovieDetails(movie.id.toString()),
        ]);

        if (!cancelled) {
          heroDataCache.set(cacheKey, { videos: videosData, details: detailsData });
          setVideos(videosData);
          setDetails(detailsData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da hero:", error);
      }
    }

    fetchHeroData();
    return () => {
      cancelled = true;
    };
  }, [movie, isActive]);

  if (!movie) return null;

  return (
    <div className="relative h-auto md:h-[85vh] w-full overflow-hidden">
      {/* Backdrop image with Ken Burns effect (pausado em slides ocultos ou quando há trailer aberto) */}
      <motion.div
        animate={
          isActive && !anyTrailerOpen
            ? {
                scale: [1, 1.12],
                x: [0, -16],
                y: [0, -8],
              }
            : false
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title || movie.name}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          unoptimized={true}
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlays: protege leitura à esquerda e abre o brilho no centro/direita sem custo de filter na GPU */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/95 via-black/70 to-black/15 md:bg-[linear-gradient(90deg,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.68)_30%,rgba(0,0,0,0.18)_56%,rgba(0,0,0,0)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(0deg,#000000_0%,rgba(0,0,0,0.55)_14%,rgba(0,0,0,0)_40%)]" />

      {/* Content */}
      <div className="relative md:absolute inset-0 z-20 flex flex-col justify-start md:justify-center pt-28 pb-14 md:pt-32 md:pb-16">
        <div className="max-w-2xl w-full px-4 md:px-8 md:ml-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            {movie.title || movie.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 text-[10px] md:text-xs font-semibold text-neutral-400 uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
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

          <p className="text-lg text-neutral-200 line-clamp-3 md:line-clamp-4 pt-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
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
