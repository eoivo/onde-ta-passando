import Link from "next/link";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import MovieCard from "@/components/MovieCard";

interface MovieGridProps {
  movies: any[];
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  currentFilters: Record<string, string | undefined>;
  mediaType: "movie" | "tv";
}

export default function MovieGrid({
  movies,
  currentPage,
  totalPages,
  baseUrl,
  currentFilters,
  mediaType,
}: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/[0.03] border border-white/10">
        <h3 className="text-2xl font-normal font-bebas tracking-wider uppercase text-white mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-neutral-400 text-sm mb-6 max-w-md">
          Tente ajustar ou remover alguns filtros para explorar outros títulos do catálogo.
        </p>
        <Link href={baseUrl}>
          <Button className="h-10 px-6 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs uppercase tracking-wider">
            Ver todos os {mediaType === "movie" ? "filmes" : "séries"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {movies.map((item, index) => (
          <MovieCard
            key={item.id}
            movie={{ ...item, media_type: item.media_type || mediaType }}
            index={index}
          />
        ))}
      </div>

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={baseUrl}
        currentFilters={currentFilters}
      />
    </div>
  );
}
