"use client";

import React, { useState, useEffect } from "react";
import { Heart, Clock, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import * as authService from "@/services/auth-api";

interface MediaActionsProps {
  mediaId: string;
  mediaType: "movie" | "tv";
  title?: string;
  name?: string;
  posterPath: string;
}

export default function MediaActions({
  mediaId,
  mediaType,
  title,
  name,
  posterPath,
}: MediaActionsProps) {
  const { isAuthenticated, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
  const [isLoadingWatched, setIsLoadingWatched] = useState(false);

  useEffect(() => {
    if (profile) {
      if (mediaType === "movie") {
        setIsFavorite(
          profile.favorites.movies.some((movie) => movie.id === mediaId)
        );
        setIsInWatchlist(
          profile.watchlist.movies.some((movie) => movie.id === mediaId)
        );
        setIsWatched(
          profile.watched.movies.some((movie) => movie.id === mediaId)
        );
      } else {
        setIsFavorite(
          profile.favorites.tvShows.some((show) => show.id === mediaId)
        );
        setIsInWatchlist(
          profile.watchlist.tvShows.some((show) => show.id === mediaId)
        );
        setIsWatched(
          profile.watched.tvShows.some((show) => show.id === mediaId)
        );
      }
    }
  }, [profile, mediaId, mediaType]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para adicionar aos favoritos");
      router.push("/login");
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await authService.removeFromFavorites(mediaType, mediaId);
        toast.success(
          `${mediaType === "movie" ? "Filme" : "Série"} removido dos favoritos`
        );
        setIsFavorite(false);
      } else {
        await authService.addToFavorites(
          mediaId,
          title,
          name,
          posterPath,
          mediaType
        );
        toast.success(
          `${
            mediaType === "movie" ? "Filme" : "Série"
          } adicionado aos favoritos`
        );
        setIsFavorite(true);
      }
      await refreshProfile();
    } catch (error) {
      toast.error("Erro ao atualizar favoritos");
      console.error("Erro ao atualizar favoritos:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error(
        "Você precisa estar logado para adicionar à lista de assistir mais tarde"
      );
      router.push("/login");
      return;
    }

    setIsLoadingWatchlist(true);
    try {
      if (isInWatchlist) {
        await authService.removeFromWatchlist(mediaType, mediaId);
        toast.success(
          `${
            mediaType === "movie" ? "Filme" : "Série"
          } removido da lista de assistir mais tarde`
        );
        setIsInWatchlist(false);
      } else {
        await authService.addToWatchlist(
          mediaId,
          title,
          name,
          posterPath,
          mediaType
        );
        toast.success(
          `${
            mediaType === "movie" ? "Filme" : "Série"
          } adicionado à lista de assistir mais tarde`
        );
        setIsInWatchlist(true);
      }
      await refreshProfile();
    } catch (error) {
      toast.error("Erro ao atualizar lista de assistir mais tarde");
      console.error("Erro ao atualizar watchlist:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleWatched = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para marcar como assistido");
      router.push("/login");
      return;
    }

    setIsLoadingWatched(true);
    try {
      if (isWatched) {
        await authService.removeFromWatched(mediaType, mediaId);
        toast.success(
          `${mediaType === "movie" ? "Filme" : "Série"} removido dos assistidos`
        );
        setIsWatched(false);
      } else {
        await authService.addToWatched(
          mediaId,
          title,
          name,
          posterPath,
          mediaType
        );
        toast.success(
          `${mediaType === "movie" ? "Filme" : "Série"} marcado como assistido`
        );
        setIsWatched(true);
      }
      await refreshProfile();
    } catch (error) {
      toast.error("Erro ao atualizar assistidos");
      console.error("Erro ao atualizar watched:", error);
    } finally {
      setIsLoadingWatched(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isFavorite
                  ? "bg-red-900/30 text-red-500 border-red-800 hover:bg-red-900/50 hover:text-red-400"
                  : "hover:bg-gray-800 hover:text-red-400"
              }`}
              onClick={handleFavorite}
              disabled={isLoadingFavorite}
            >
              {isLoadingFavorite ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isInWatchlist
                  ? "bg-blue-900/30 text-blue-500 border-blue-800 hover:bg-blue-900/50 hover:text-blue-400"
                  : "hover:bg-gray-800 hover:text-blue-400"
              }`}
              onClick={handleWatchlist}
              disabled={isLoadingWatchlist}
            >
              {isLoadingWatchlist ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Clock
                  className={`h-5 w-5 ${isInWatchlist ? "fill-blue-500" : ""}`}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isInWatchlist
                ? "Remover da lista de assistir mais tarde"
                : "Adicionar à lista de assistir mais tarde"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isWatched
                  ? "bg-green-900/30 text-green-500 border-green-800 hover:bg-green-900/50 hover:text-green-400"
                  : "hover:bg-gray-800 hover:text-green-400"
              }`}
              onClick={handleWatched}
              disabled={isLoadingWatched}
            >
              {isLoadingWatched ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Eye
                  className={`h-5 w-5 ${isWatched ? "fill-green-500" : ""}`}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isWatched ? "Remover dos assistidos" : "Marcar como assistido"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
