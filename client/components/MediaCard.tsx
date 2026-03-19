"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Movie, TV } from "@/services/tmdb-api";
import { X, AlertCircle, Eye, ChevronRight } from "lucide-react";
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
  const router = useRouter();
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
        className="relative group rounded-2xl overflow-hidden transition-all duration-300 shadow-lg bg-white/5 border border-white/5 hover:border-red-600/30 hover:shadow-red-600/10 backdrop-blur-sm"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Link href={href} className="block">
          <div className="aspect-[2/3] relative overflow-hidden">
            <Image
              src={posterPath}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            <div className="absolute inset-0 h-full w-full bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[6px] flex flex-col items-center justify-center p-4 z-20 gap-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(href);
                }}
                className="w-full max-w-[140px] bg-white text-black text-[10px] font-black uppercase tracking-widest py-2.5 rounded-full flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 active:scale-95 shadow-lg hover:bg-gray-200"
              >
                <Eye className="w-3 h-3" />
                Ver Detalhes
              </button>
              
              {onRemove && (
                <button
                  onClick={handleRemoveClick}
                  className="w-full max-w-[140px] bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-full border border-red-500/30 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 active:scale-95 hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
          <div className="p-3 space-y-2">
            <h3 className="font-bold text-white text-xs md:text-sm truncate group-hover:text-red-500 transition-colors">
              {title}
            </h3>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500/80">
                {type === "movie" ? "Filme" : "Série"}
              </span>
              {date && (
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  {date}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#0f0f0f] border-white/5 text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-3 font-black uppercase tracking-widest text-base">
              <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              Confirmar remoção
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium">
              Deseja realmente remover{" "}
              <strong className="text-white font-bold">{title}</strong> da sua lista de{" "}
              <span className="text-red-500 font-bold italic">{getCollectionLabel()}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border-white/5 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            >
              Remover dos {getCollectionLabel()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
