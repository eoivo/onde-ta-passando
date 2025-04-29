"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Movie, TV } from "@/services/tmdb-api";
import { X, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface MediaCardProps {
  item: {
    id: string;
    title?: string;
    name?: string;
    poster_path: string;
    addedAt?: string;
  };
  type: "movie" | "tv";
  onRemove?: (id: string, type: "movie" | "tv") => void;
  collection: "favorites" | "watchlist" | "watched";
}

export default function MediaCard({
  item,
  type,
  onRemove,
  collection,
}: MediaCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const title = item.title || item.name || "Título desconhecido";
  const date = item.addedAt
    ? new Date(item.addedAt).toLocaleDateString("pt-BR")
    : "";
  const href = type === "movie" ? `/filme/${item.id}` : `/serie/${item.id}`;

  const placeholderImage = "/poster-placeholder.svg";
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : placeholderImage;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDialog(true);
  };

  const confirmRemove = () => {
    if (onRemove) {
      onRemove(item.id, type);
    }
    setShowConfirmDialog(false);
  };

  const cancelRemove = () => {
    setShowConfirmDialog(false);
  };

  const getCollectionLabel = () => {
    switch (collection) {
      case "favorites":
        return "favoritos";
      case "watchlist":
        return "quero assistir";
      case "watched":
        return "assistidos";
      default:
        return "";
    }
  };

  const getCollectionLabelCapitalized = () => {
    switch (collection) {
      case "favorites":
        return "Favoritos";
      case "watchlist":
        return "Quero Assistir";
      case "watched":
        return "Assistidos";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className="relative group rounded-lg overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl bg-gray-900 hover:bg-gray-800"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link href={href} className="block">
          <div className="aspect-[2/3] relative">
            <Image
              src={posterPath}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            {isHovering && onRemove && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRemoveClick}
                      className="absolute top-2 right-2 rounded-full bg-black/80 p-1 text-red-500 hover:bg-red-500 hover:text-white transition-colors z-10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remover dos {getCollectionLabel()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
              <span>{type === "movie" ? "Filme" : "Série"}</span>
              {date && <span>Adicionado em: {date}</span>}
            </div>
          </div>
        </Link>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirmar remoção
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Deseja realmente remover{" "}
              <strong className="text-white">{title}</strong> da sua lista de{" "}
              {getCollectionLabel()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
