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
  const selectContentClass = "bg-gray-900/95 backdrop-blur-xl border-gray-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200";

  return (
    <div className="space-y-6 mb-8">
      {isMobile ? (
        <div className="flex justify-between items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-gray-900/40 backdrop-blur-md border-gray-800 rounded-xl h-11">
                <Filter className="w-4 h-4 text-red-500" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] bg-gray-950 border-gray-800 rounded-t-[2.5rem] p-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-red-600" />
                    Refinar Busca
                  </h3>
                  <SheetClose className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Streaming Filter Mobile */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-400">
                      Plataforma
                    </label>
                    <Select value={selectedProvider || "all"} onValueChange={(val) => setSelectedProvider(val === "all" ? "" : val)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Onde assistir" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="focus:bg-red-500/10 focus:text-red-100">
                            <div className="flex items-center gap-2">
                              {p.logo && <Image src={p.logo} alt="" width={20} height={20} className="rounded-md" />}
                              {p.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Genre Filter Mobile */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-400">Gênero</label>
                    <Select value={selectedGenre || "all"} onValueChange={(val) => setSelectedGenre(val === "all" ? "" : val)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Escolha um gênero" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="all">Todos os gêneros</SelectItem>
                        {genres.map((g) => (
                          <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Filter Mobile */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-400">Ordenar por</label>
                    <Select value={selectedSort} onValueChange={setSelectedSort}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Como listar" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        {sortOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Filter Mobile */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-400">Ano</label>
                    <Select value={selectedYear || "all"} onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Lançamento" />
                      </SelectTrigger>
                      <SelectContent className={selectContentClass}>
                        <SelectItem value="all">Qualquer ano</SelectItem>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-6 bg-gray-900/50 backdrop-blur-md border-t border-gray-800">
                  <SheetClose asChild>
                    <Button onClick={applyFilters} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20">
                      Ver Resultados
                    </Button>
                  </SheetClose>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="w-full mt-2 text-gray-400">
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-400 hover:bg-red-500/5">
              <X className="w-4 h-4 mr-1" /> Limpar
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          {/* Desktop Filters */}
          <div className="flex flex-wrap gap-3 p-1 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl">
            {/* Streaming Filter */}
            <div className="w-52">
              <Select value={selectedProvider || "all"} onValueChange={(val) => setSelectedProvider(val === "all" ? "" : val)}>
                <SelectTrigger className="border-0 bg-transparent hover:bg-white/5 h-11 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all">
                  <div className="flex items-center gap-2 px-1">
                    <SelectValue placeholder="Streamings" />
                  </div>
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-red-500/10 focus:text-red-100">
                      <div className="flex items-center gap-2">
                        {p.logo && <Image src={p.logo} alt="" width={18} height={18} className="rounded-sm" />}
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[1px] h-6 bg-gray-800 my-auto" />

            {/* Genre Filter */}
            <div className="w-48">
              <Select value={selectedGenre || "all"} onValueChange={(val) => setSelectedGenre(val === "all" ? "" : val)}>
                <SelectTrigger className="border-0 bg-transparent hover:bg-white/5 h-11 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all">
                  <SelectValue placeholder="Gênero" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="all">Todos os gêneros</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[1px] h-6 bg-gray-800 my-auto" />

            {/* Sort Filter */}
            <div className="w-52">
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="border-0 bg-transparent hover:bg-white/5 h-11 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[1px] h-6 bg-gray-800 my-auto" />

            {/* Year Filter */}
            <div className="w-40">
              <Select value={selectedYear || "all"} onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)}>
                <SelectTrigger className="border-0 bg-transparent hover:bg-white/5 h-11 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
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
              className="group h-11 px-4 hover:bg-red-500/5 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-xl"
            >
              <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

