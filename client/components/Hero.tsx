"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VideoPlayer from "./VideoPlayer";
import { useEffect, useState } from "react";
import { getMovieVideos, getTvVideos, getMovieDetails, getTvDetails } from "@/services/tmdb-api";

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
            : getMovieDetails(movie.id.toString())
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
    <div className="relative h-[85vh] w-full">
      {/* Backdrop image */}
      <Image
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        alt={movie.title || movie.name}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pb-16 md:pb-24 pt-8 md:pt-20">
        <div className="max-w-2xl w-full px-4 md:px-8 md:ml-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight uppercase">
            {movie.title || movie.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest">
            <span>
              {new Date(
                movie.release_date || movie.first_air_date
              ).getFullYear()}
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

          <div className="flex flex-col md:flex-row gap-4">
            {videos.length > 0 ? (
              <VideoPlayer
                videos={videos}
                onTrailerStateChange={onTrailerStateChange}
              />
            ) : (
              <Link
                href={`/${movie.media_type === "tv" ? "serie" : "filme"}/${movie.id
                  }`}
                className="w-full md:w-auto"
              >
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 w-full md:w-[170px]"
                >
                  <Info className="mr-2 h-5 w-5" /> Ver detalhes
                </Button>
              </Link>
            )}
            <Link
              href={`/${movie.media_type === "tv" ? "serie" : "filme"}/${movie.id
                }`}
              className="w-full md:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-[170px] bg-black/20 border-white/20 hover:bg-white/10"
              >
                <Info className="mr-2 h-5 w-5" /> Onde assistir
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
