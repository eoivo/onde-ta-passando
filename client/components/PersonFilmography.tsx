"use client";

import { useMemo, useState } from "react";
import { Film, Tv } from "lucide-react";
import MovieCard from "./MovieCard";

interface PersonFilmographyProps {
  acting: any[];
  directing: any[];
}

const PAGE_SIZE = 24;

const pillBase =
  "h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none";
const pillOn = "bg-white text-black";
const pillOff =
  "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]";

export default function PersonFilmography({
  acting,
  directing,
}: PersonFilmographyProps) {
  const hasActing = acting.length > 0;
  const hasDirecting = directing.length > 0;

  const [role, setRole] = useState<"acting" | "directing">(
    hasActing ? "acting" : "directing"
  );
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const items = useMemo(() => {
    const base = role === "acting" ? acting : directing;
    const filtered =
      mediaFilter === "all"
        ? base
        : base.filter((i) => i.media_type === mediaFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "recent") {
        const da = new Date(a.release_date || a.first_air_date || 0).getTime();
        const db = new Date(b.release_date || b.first_air_date || 0).getTime();
        return db - da;
      }
      return (b.popularity || 0) - (a.popularity || 0);
    });
  }, [role, mediaFilter, sort, acting, directing]);

  const reset = () => setVisible(PAGE_SIZE);

  if (!hasActing && !hasDirecting) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
            Filmografia
          </h2>
          <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
            {items.length} {items.length === 1 ? "título" : "títulos"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasActing && hasDirecting && (
            <div className="inline-flex p-1 rounded-full bg-white/[0.03] border border-white/10 mr-1">
              <button
                type="button"
                onClick={() => { setRole("acting"); reset(); }}
                className={`h-7 px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer leading-none ${
                  role === "acting" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Atuação
              </button>
              <button
                type="button"
                onClick={() => { setRole("directing"); reset(); }}
                className={`h-7 px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer leading-none ${
                  role === "directing" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Direção
              </button>
            </div>
          )}

          <button type="button" onClick={() => { setMediaFilter("all"); reset(); }} className={`${pillBase} ${mediaFilter === "all" ? pillOn : pillOff}`}>
            Todos
          </button>
          <button type="button" onClick={() => { setMediaFilter("movie"); reset(); }} className={`${pillBase} ${mediaFilter === "movie" ? pillOn : pillOff}`}>
            <Film className="w-3.5 h-3.5" /> Filmes
          </button>
          <button type="button" onClick={() => { setMediaFilter("tv"); reset(); }} className={`${pillBase} ${mediaFilter === "tv" ? pillOn : pillOff}`}>
            <Tv className="w-3.5 h-3.5" /> Séries
          </button>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as "popular" | "recent"); reset(); }}
            aria-label="Ordenar filmografia"
            className="h-8 pl-3 pr-7 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white focus:outline-none cursor-pointer"
          >
            <option value="popular" className="bg-neutral-900">Mais populares</option>
            <option value="recent" className="bg-neutral-900">Mais recentes</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl py-14 text-center text-sm text-neutral-400">
          Nenhum título encontrado para este filtro.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {items.slice(0, visible).map((item, idx) => (
              <div key={`${item.media_type}-${item.id}`} className="space-y-2">
                <div className="aspect-[2/3]">
                  <MovieCard movie={item} index={idx % PAGE_SIZE} />
                </div>
                {item.character && role === "acting" && (
                  <p className="text-[11px] text-neutral-500 truncate">
                    como <span className="text-neutral-300">{item.character}</span>
                  </p>
                )}
                {item.job && role === "directing" && (
                  <p className="text-[11px] text-neutral-500 truncate">{item.job === "Director" ? "Direção" : "Criação"}</p>
                )}
              </div>
            ))}
          </div>

          {visible < items.length && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="h-10 px-5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Mostrar mais ({items.length - visible} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
