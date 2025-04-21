import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-medium mb-4">
          Nenhum resultado encontrado
        </h3>
        <p className="text-gray-400 mb-6">
          Tente ajustar os filtros para ver mais resultados.
        </p>
        <Link href={baseUrl}>
          <Button>
            Ver todos os {mediaType === "movie" ? "filmes" : "séries"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {movies.map((item) => (
          <Link
            key={item.id}
            href={`/${mediaType === "movie" ? "filme" : "serie"}/${item.id}`}
            className="group transition-transform hover:scale-105 duration-200"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
              {item.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}

              {/* Overlay com informações */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    {item.vote_average?.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {new Date(
                    item.release_date || item.first_air_date
                  ).getFullYear() || "N/A"}
                </p>

                {/* Sinopse */}
                {item.overview && (
                  <div className="mt-2 max-h-0 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                    <p className="text-xs text-gray-300 line-clamp-3">
                      {item.overview}
                    </p>
                  </div>
                )}
              </div>

              {/* Badge para itens populares */}
              {item.popularity > 100 && (
                <Badge className="absolute top-2 right-2 bg-primary">
                  Popular
                </Badge>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-2">
              {item.title || item.name}
            </h3>
          </Link>
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
