"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLoadingStore } from "@/store/loading-store";
import { useDragScroll } from "@/hooks/useDragScroll";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  genres: any[];
  currentFilters: {
    genre?: string;
    sort?: string;
    year?: string;
    page?: string;
    provider?: string;
  };
  baseUrl: string;
  mediaType: "movie" | "tv";
  totalResults?: number;
  title?: string;
}

const providers = [
  { id: "all", name: "Todos os Streamings", logo: "" },
  {
    id: "8",
    name: "Netflix",
    logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
  },
  {
    id: "119",
    name: "Prime Video",
    logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg",
  },
  {
    id: "337",
    name: "Disney+",
    logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg",
  },
  {
    id: "384|1899",
    name: "Max",
    logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg",
  },
  {
    id: "307",
    name: "Globoplay",
    logo: "https://image.tmdb.org/t/p/original/7Cg8esVVXOijXAm1f1vrS7jVjcN.jpg",
  },
  {
    id: "350",
    name: "Apple TV+",
    logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg",
  },
  {
    id: "531",
    name: "Paramount+",
    logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg",
  },
  {
    id: "283",
    name: "Crunchyroll",
    logo: "https://image.tmdb.org/t/p/original/fzN5Jok5Ig1eJ7gyNGoMhnLSCfh.jpg",
  },
];

// Tradução para gêneros de séries que a API do TMDB retorna em inglês no locale pt-BR
const GENRE_TRANSLATIONS: Record<string, string> = {
  "Action & Adventure": "Ação e Aventura",
  "Sci-Fi & Fantasy": "Ficção e Fantasia",
  "War & Politics": "Guerra e Política",
  "Kids": "Infantil",
  "News": "Notícias",
  "Reality": "Reality",
  "Soap": "Novela",
  "Talk": "Talk Show",
  "Thriller": "Suspense",
};

const formatGenreName = (name: string) => GENRE_TRANSLATIONS[name] || name;

export default function FilterBar({
  genres,
  currentFilters,
  baseUrl,
  mediaType,
  totalResults,
  title,
}: FilterBarProps) {
  const router = useRouter();
  const { setLoading } = useLoadingStore();
  const genresScrollRef = useRef<HTMLDivElement>(null);
  useDragScroll(genresScrollRef);

  const [isPageReload, setIsPageReload] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSort, setSelectedSort] = useState("popularity.desc");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) =>
    (currentYear - i).toString()
  );

  const sortOptions = [
    { value: "popularity.desc", label: "Popularidade (maior)" },
    { value: "popularity.asc", label: "Popularidade (menor)" },
    { value: "vote_average.desc", label: "Avaliação (maior)" },
    { value: "vote_average.asc", label: "Avaliação (menor)" },
    {
      value:
        mediaType === "movie" ? "release_date.desc" : "first_air_date.desc",
      label: "Data de lançamento (recente)",
    },
    {
      value: mediaType === "movie" ? "release_date.asc" : "first_air_date.asc",
      label: "Data de lançamento (antigo)",
    },
    ...(mediaType === "movie"
      ? [{ value: "revenue.desc", label: "Bilheteria (maior)" }]
      : []),
  ];

  useEffect(() => {
    if (!isPageReload) {
      setSelectedGenre(currentFilters.genre || "");
      setSelectedSort(currentFilters.sort || "popularity.desc");
      setSelectedYear(currentFilters.year || "");
      setSelectedProvider(currentFilters.provider || "");
    } else {
      if (
        Object.keys(currentFilters).some(
          (key) =>
            key !== "page" && currentFilters[key as keyof typeof currentFilters]
        )
      ) {
        // Only replace if filters exist but it's a cold load without them being in state
        setSelectedGenre(currentFilters.genre || "");
        setSelectedSort(currentFilters.sort || "popularity.desc");
        setSelectedYear(currentFilters.year || "");
        setSelectedProvider(currentFilters.provider || "");
      }
      setIsPageReload(false);
    }
  }, [currentFilters, isPageReload]);

  useEffect(() => {
    if (isPageReload) return;
    applyFilters();
  }, [selectedGenre, selectedSort, selectedYear, selectedProvider]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedSort && selectedSort !== "popularity.desc")
      params.set("sort", selectedSort);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedProvider) params.set("provider", selectedProvider);

    const newUrl = `${baseUrl}?${params.toString()}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      setLoading(true, mediaType === "movie" ? "filmes" : "séries");
      router.push(newUrl);
    }
  };

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedSort("popularity.desc");
    setSelectedYear("");
    setSelectedProvider("");

    if (window.location.search) {
      setLoading(true, mediaType === "movie" ? "filmes" : "séries");
      router.push(baseUrl);
    }
  };

  const hasActiveFilters =
    selectedGenre ||
    selectedSort !== "popularity.desc" ||
    selectedYear ||
    selectedProvider;

  const selectTriggerClass =
    "bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 hover:bg-white/[0.07] transition-colors duration-200 rounded-full h-10 px-4 text-xs font-medium text-neutral-200 focus:ring-0 focus:ring-offset-0";
  const selectContentClass =
    "bg-neutral-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200 z-[60] max-h-[280px] text-neutral-200";

  return (
    <div className="space-y-5 mb-10">
      {/* Cabeçalho Editorial em Bebas Neue */}
      <div className="flex items-center gap-3">
        <h1 className="text-4xl md:text-6xl font-normal font-bebas tracking-wider text-white uppercase leading-none">
          {title || (mediaType === "movie" ? "Filmes" : "Séries")}
        </h1>
        {typeof totalResults === "number" && totalResults > 0 && (
          <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 inline-flex items-center leading-none">
            {totalResults >= 10000 ? "+10 mil títulos" : `${totalResults.toLocaleString("pt-BR")} títulos`}
          </span>
        )}
      </div>

      {/* Gêneros como Pills (Scroll horizontal em 1 linha no mobile + wrap limpo no desktop) */}
      <div>
        <div
          ref={genresScrollRef}
          className="flex flex-nowrap md:flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0"
        >
          <button
            type="button"
            onClick={() => setSelectedGenre("")}
            className={cn(
              "h-8 px-4 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors duration-200 border uppercase tracking-wider leading-none inline-flex items-center justify-center flex-shrink-0",
              !selectedGenre
                ? "bg-red-600 border-red-500 text-white"
                : "bg-white/[0.04] border-white/10 text-neutral-400 hover:border-white/25 hover:text-white hover:bg-white/[0.08]"
            )}
          >
            Todos
          </button>
          {genres.map((g) => {
            const isActive = selectedGenre === g.id.toString();
            return (
              <button
                type="button"
                key={g.id}
                onClick={() => setSelectedGenre(isActive ? "" : g.id.toString())}
                className={cn(
                  "h-8 px-4 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors duration-200 border uppercase tracking-wider leading-none inline-flex items-center justify-center flex-shrink-0",
                  isActive
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-white/[0.04] border-white/10 text-neutral-400 hover:border-white/25 hover:text-white hover:bg-white/[0.08]"
                )}
              >
                {formatGenreName(g.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdowns Secundários em Pílula Glass Preta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Streaming Filter */}
          <div className="w-full sm:w-auto min-w-[175px]">
            <Select value={selectedProvider || "all"} onValueChange={(val) => setSelectedProvider(val === "all" ? "" : val)}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Onde assistir" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={8} collisionPadding={20}>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      {p.logo && <Image src={p.logo} alt="" width={18} height={18} className="rounded-[4px]" />}
                      <span>{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="w-full sm:w-auto min-w-[195px]">
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={8} collisionPadding={20}>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="w-full sm:w-auto min-w-[135px]">
            <Select value={selectedYear || "all"} onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={8} collisionPadding={20}>
                <SelectItem value="all" className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                  Qualquer ano
                </SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y} className="rounded-lg focus:bg-white/10 focus:text-white cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-red-600/15 hover:border-red-500/40 text-neutral-300 hover:text-white transition-colors duration-200 flex items-center justify-center w-full sm:w-auto text-xs font-semibold"
          >
            <X className="w-3.5 h-3.5 mr-1.5 text-red-500" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}

