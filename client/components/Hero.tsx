"use client";

import Image from "next/image";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VideoPlayer from "./VideoPlayer";
import { useEffect, useState } from "react";
import { getMovieVideos, getTvVideos } from "@/services/tmdb-api";

interface HeroProps {
  movie: any;
  onTrailerStateChange?: (isOpen: boolean) => void;
}

export default function Hero({ movie, onTrailerStateChange }: HeroProps) {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchVideos() {
      if (!movie) return;

      const mediaType = movie.media_type || "movie";
      try {
        const videosData =
          mediaType === "tv"
            ? await getTvVideos(movie.id.toString())
            : await getMovieVideos(movie.id.toString());

        setVideos(videosData);
      } catch (error) {
        console.error("Erro ao carregar vídeos:", error);
      }
    }

    fetchVideos();
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="relative h-[95vh] w-full">
      {/* Backdrop image */}
      <Image
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
        alt={movie.title || movie.name}
        fill
        priority
        className="object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center pt-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8 md:ml-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            {movie.title || movie.name}
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-green-500 font-semibold">
              {Math.round(movie.vote_average * 10)}% relevante
            </span>
            <span>
              {new Date(
                movie.release_date || movie.first_air_date
              ).getFullYear()}
            </span>
          </div>

          <p className="text-lg text-gray-300 line-clamp-3 md:line-clamp-4">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-4 mb-16 md:mb-24">
            {videos.length > 0 ? (
              <VideoPlayer
                videos={videos}
                onTrailerStateChange={onTrailerStateChange}
              />
            ) : (
              <Link
                href={`/${movie.media_type === "tv" ? "serie" : "filme"}/${
                  movie.id
                }`}
              >
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Info className="mr-2 h-5 w-5" /> Ver detalhes
                </Button>
              </Link>
            )}
            <Link
              href={`/${movie.media_type === "tv" ? "serie" : "filme"}/${
                movie.id
              }`}
            >
              <Button size="lg" variant="outline">
                <Info className="mr-2 h-5 w-5" /> Onde assistir
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
