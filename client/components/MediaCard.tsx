"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ArrowRight, Film, Tv } from "lucide-react";
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

  const getCollectionLabel = () => {
    switch (collection) {
      case "favorites":
        return "favoritos";
      case "watchlist":
        return "quero ver";
      case "watched":
        return "assistidos";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="relative group rounded-xl overflow-hidden transition-all duration-300 shadow-lg bg-white/[0.03] border border-white/10 hover:border-white/25">
        {/* Botão de remoção rápido (sempre acessível no mobile e visível no hover no desktop) */}
        {onRemove && (
          <button
            type="button"
            onClick={handleRemoveClick}
            title={`Remover de ${getCollectionLabel()}`}
            aria-label={`Remover ${title} de ${getCollectionLabel()}`}
            className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-black/65 hover:bg-red-600/90 border border-white/15 hover:border-red-500/60 backdrop-blur-md text-neutral-300 hover:text-white flex items-center justify-center transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 cursor-pointer shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        <Link href={href} className="block">
          <div className="aspect-[2/3] relative overflow-hidden bg-neutral-900">
            <Image
              src={posterPath}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* Badge discreta do tipo de mídia no canto superior esquerdo */}
            <div className="absolute top-2.5 left-2.5 z-20 px-2.5 h-6 rounded-full bg-black/65 border border-white/15 backdrop-blur-md inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-200 leading-none">
              {type === "movie" ? (
                <>
                  <Film className="w-2.5 h-2.5 text-red-500" />
                  <span>Filme</span>
                </>
              ) : (
                <>
                  <Tv className="w-2.5 h-2.5 text-red-500" />
                  <span>Série</span>
                </>
              )}
            </div>

            {/* Overlay editorial sutil no hover (desktop) */}
            <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3.5 z-20">
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-white/90">
                  Ver página da obra
                </span>
                <span className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-1">
            <h3 className="font-semibold text-white text-xs md:text-sm truncate group-hover:text-red-400 transition-colors">
              {title}
            </h3>
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>{type === "movie" ? "Filme" : "Série"}</span>
              {date && <span className="text-neutral-500">{date}</span>}
            </div>
          </div>
        </Link>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#0d0d10]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl sm:max-w-[420px] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bebas text-2xl md:text-3xl tracking-wider uppercase text-white">
              Remover da lista?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400 text-sm leading-relaxed pt-1">
              Deseja remover{" "}
              <strong className="text-white font-semibold">{title}</strong> da sua lista de{" "}
              <span className="text-red-400 font-semibold">{getCollectionLabel()}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
            <AlertDialogCancel className="h-10 px-5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.1] hover:border-white/20 text-xs font-semibold transition-colors cursor-pointer mt-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="h-10 px-5 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
