import React from "react";

interface AgeRatingBadgeProps {
  rating: string | null | undefined;
}

const RATING_STYLES: Record<
  string,
  { label: string; bg: string; text: string; title: string }
> = {
  L: {
    label: "L",
    bg: "bg-emerald-600 border-emerald-500/40",
    text: "text-white",
    title: "Livre para todos os públicos",
  },
  "10": {
    label: "10",
    bg: "bg-sky-600 border-sky-500/40",
    text: "text-white",
    title: "Não recomendado para menores de 10 anos",
  },
  "12": {
    label: "12",
    bg: "bg-amber-500 border-amber-400/40",
    text: "text-black",
    title: "Não recomendado para menores de 12 anos",
  },
  "14": {
    label: "14",
    bg: "bg-orange-600 border-orange-500/40",
    text: "text-white",
    title: "Não recomendado para menores de 14 anos",
  },
  "16": {
    label: "16",
    bg: "bg-red-600 border-red-500/40",
    text: "text-white",
    title: "Não recomendado para menores de 16 anos",
  },
  "18": {
    label: "18",
    bg: "bg-neutral-950 border-white/30",
    text: "text-white",
    title: "Não recomendado para menores de 18 anos",
  },
};

export function extractBrazilianRating(
  media: any,
  mediaType: "movie" | "tv"
): string | null {
  if (!media) return null;

  if (mediaType === "movie") {
    const results: any[] = media.release_dates?.results || [];
    const brEntry = results.find((r) => r.iso_3166_1 === "BR");
    if (brEntry?.release_dates) {
      const found = brEntry.release_dates.find(
        (d: any) => d.certification && d.certification.trim() !== ""
      );
      if (found) {
        const cert = found.certification.trim().toUpperCase();
        if (cert === "LIVRE") return "L";
        if (RATING_STYLES[cert]) return cert;
      }
    }
  } else {
    const results: any[] = media.content_ratings?.results || [];
    const brEntry = results.find((r) => r.iso_3166_1 === "BR");
    if (brEntry?.rating) {
      const cert = brEntry.rating.trim().toUpperCase();
      if (cert === "LIVRE") return "L";
      if (RATING_STYLES[cert]) return cert;
    }
  }

  return null;
}

export default function AgeRatingBadge({ rating }: AgeRatingBadgeProps) {
  if (!rating) return null;
  const style = RATING_STYLES[rating];
  if (!style) return null;

  return (
    <span
      title={style.title}
      aria-label={style.title}
      className={`h-5 min-w-[20px] px-1.5 rounded-[5px] border ${style.bg} ${style.text} text-[11px] font-black tracking-tight inline-flex items-center justify-center leading-none select-none shadow-sm`}
    >
      {style.label}
    </span>
  );
}
