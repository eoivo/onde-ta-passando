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
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { useLoadingStore } from "@/store/loading-store";

interface FilterBarProps {
  genres: any[];
  currentFilters: {
    genre?: string;
    sort?: string;
    year?: string;
    page?: string;
  };
  baseUrl: string;
  mediaType: "movie" | "tv";
}

export default function FilterBar({
  genres,
  currentFilters,
  baseUrl,
  mediaType,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMobile();
  const { setLoading } = useLoadingStore();

  const [isPageReload, setIsPageReload] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSort, setSelectedSort] = useState("popularity.desc");
  const [selectedYear, setSelectedYear] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1939 }, (_, i) =>
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
    } else {
      if (
        Object.keys(currentFilters).some(
          (key) =>
            key !== "page" && currentFilters[key as keyof typeof currentFilters]
        )
      ) {
        router.replace(baseUrl);
      }
      setIsPageReload(false);
    }
  }, [currentFilters, isPageReload, router, baseUrl]);

  useEffect(() => {
    if (isPageReload) return;

    applyFilters();
  }, [selectedGenre, selectedSort, selectedYear]);

  const applyFilters = () => {
    setLoading(true, mediaType === "movie" ? "filmes" : "séries");

    const params = new URLSearchParams();

    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedSort && selectedSort !== "popularity.desc")
      params.set("sort", selectedSort);
    if (selectedYear) params.set("year", selectedYear);

    router.push(`${baseUrl}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedGenre("");
    setSelectedSort("popularity.desc");
    setSelectedYear("");

    setLoading(true, mediaType === "movie" ? "filmes" : "séries");

    router.push(baseUrl);
  };

  const hasActiveFilters =
    selectedGenre || selectedSort !== "popularity.desc" || selectedYear;

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value === "all" ? "" : value);
    if (isMobile) {
      const closeButton = document.querySelector("[data-sheet-close]");
      if (closeButton && closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    }
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    if (isMobile) {
      const closeButton = document.querySelector("[data-sheet-close]");
      if (closeButton && closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value === "all" ? "" : value);
    if (isMobile) {
      const closeButton = document.querySelector("[data-sheet-close]");
      if (closeButton && closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    }
  };

  const renderDesktopFilters = () => (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="w-48">
        <Select
          value={selectedGenre || "all"}
          onValueChange={handleGenreChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os gêneros</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <Select value={selectedYear || "all"} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os anos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="ml-auto">
          <X className="w-4 h-4 mr-2" /> Limpar filtros
        </Button>
      )}
    </div>
  );

  const renderMobileFilters = () => (
    <div className="flex justify-between items-center mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <div className="py-6 px-2 space-y-6">
            <h3 className="text-lg font-medium mb-4">Filtros</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Gênero</label>
                <Select
                  value={selectedGenre || "all"}
                  onValueChange={handleGenreChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os gêneros</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Ordenar por
                </label>
                <Select value={selectedSort} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Ano</label>
                <Select
                  value={selectedYear || "all"}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <SheetClose asChild>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" /> Limpar todos os filtros
                </Button>
              </SheetClose>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" /> Limpar filtros
        </Button>
      )}
    </div>
  );

  return <>{isMobile ? renderMobileFilters() : renderDesktopFilters()}</>;
}
