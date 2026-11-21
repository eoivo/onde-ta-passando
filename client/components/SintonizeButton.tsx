"use client";

import { useRouter } from "next/navigation";

interface SintonizeButtonProps {
    id: string;
    mediaType: "movie" | "tv";
}

export default function SintonizeButton({ id, mediaType }: SintonizeButtonProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.push(`/sintonia?id=${id}&type=${mediaType}`)}
            className="h-10 px-4 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white hover:bg-red-600/15 hover:border-red-500/50 transition-all duration-200 group inline-flex items-center gap-2"
            title="Encontrar obras na mesma sintonia"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-red-500 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
            >
                <path d="M2 10v3" />
                <path d="M6 6v11" />
                <path d="M10 3v18" />
                <path d="M14 8v7" />
                <path d="M18 5v13" />
                <path d="M22 10v3" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] leading-none">Sintonia</span>
        </button>
    );
}
