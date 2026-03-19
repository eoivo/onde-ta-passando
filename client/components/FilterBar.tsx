"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X, Tv } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { useLoadingStore } from "@/store/loading-store";
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
    id: "1899",
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
    name: "Apple TV",
    logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg",
  },
  {
    id: "531",
    name: "Paramount+",
    logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg",
  },
];

export default function FilterBar({
  genres,
  currentFilters,
  baseUrl,
  mediaType,
  totalResults,
  title,
}: FilterBarProps) {
  const router = useRouter();
  const isMobile = useMobile();
  const { setLoading } = useLoadingStore();

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

  const selectTriggerClass = "bg-gray-900/40 backdrop-blur-md border-gray-800 hover:border-red-500/50 hover:bg-gray-800/60 transition-all duration-300 rounded-xl h-11 text-sm focus:ring-red-500/20";
  const selectContentClass = "bg-gray-900/95 backdrop-blur-xl border-gray-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[60] max-h-[280px]";

  return (
    <div className="space-y-4 mb-10">
      {/* Opção A: Título */}
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase tabular-nums">
          {title || (mediaType === "movie" ? "Filmes" : "Séries")}
        </h1>
      </div>

      {/* Opção A: Gêneros como Pills (Envolvendo em múltiplas linhas para evitar corte) */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setSelectedGenre("")}
            className={cn(
              "px-5 py-2 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 border uppercase tracking-widest",
              !selectedGenre
                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40"
                : "bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-800/60"
            )}
          >
            Todos
          </button>
          {genres.map((g) => {
            const isActive = selectedGenre === g.id.toString();
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(isActive ? "" : g.id.toString())}
                className={cn(
                  "px-5 py-2 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 border uppercase tracking-widest",
                  isActive
                    ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40"
                    : "bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-800/60"
                )}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opção A: Dropdowns Secundários */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
          {/* Streaming Filter */}
          <div className="w-full sm:w-auto min-w-[170px]">
            <Select value={selectedProvider || "all"} onValueChange={(val) => setSelectedProvider(val === "all" ? "" : val)}>
              <SelectTrigger className="bg-gray-900/40 backdrop-blur-md border border-gray-800 hover:border-red-500/50 hover:bg-gray-800/60 transition-all duration-300 rounded-xl h-11 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="Onde assistir" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={10} collisionPadding={20}>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="focus:bg-red-500/10 focus:text-red-100">
                    <div className="flex items-center gap-2">
                      {p.logo && <Image src={p.logo} alt="" width={16} height={16} className="rounded-sm" />}
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div className="w-full sm:w-auto min-w-[180px]">
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="bg-gray-900/40 backdrop-blur-md border border-gray-800 hover:border-red-500/50 hover:bg-gray-800/60 transition-all duration-300 rounded-xl h-11 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={10} collisionPadding={20}>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <Select value={selectedYear || "all"} onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)}>
              <SelectTrigger className="bg-gray-900/40 backdrop-blur-md border border-gray-800 hover:border-red-500/50 hover:bg-gray-800/60 transition-all duration-300 rounded-xl h-11 text-xs font-semibold focus:ring-0">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className={selectContentClass} side="bottom" position="popper" sideOffset={10} collisionPadding={20}>
                <SelectItem value="all">Qualquer ano</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="group h-11 px-6 hover:bg-red-500/5 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-xl flex items-center justify-center w-full sm:w-auto text-xs font-bold"
          >
            <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}

