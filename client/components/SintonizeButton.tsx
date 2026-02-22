"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface SintonizeButtonProps {
    id: string;
    mediaType: "movie" | "tv";
}

export default function SintonizeButton({ id, mediaType }: SintonizeButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push(`/sintonize?id=${id}&type=${mediaType}`)}
            className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg text-white hover:scale-105 transition-all shadow-lg shadow-red-600/20 group flex items-center gap-2"
            title="Encontrar parecidos (Vibe)"
        >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Sintonizar</span>
        </button>
    );
}
