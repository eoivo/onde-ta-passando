import { getGenres, discoverTVShows } from "@/services/tmdb-api";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TVShowsPage({
  searchParams,
}: {
  searchParams: { genre?: string; sort?: string; year?: string; page?: string };
}) {
  const genres = await getGenres("tv");

  const params = await searchParams;
  const genreId = params.genre || "";
  const sortBy = params.sort || "popularity.desc";
  const year = params.year || "";
  const page = Number.parseInt(params.page || "1");

  const { results: tvShows, total_pages } = await discoverTVShows({
    genreId,
    sortBy,
    year,
    page,
  });

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Séries</h1>

        <FilterBar
          genres={genres}
          currentFilters={params}
          baseUrl="/series"
          mediaType="tv"
        />

        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
            </div>
          }
        >
          <MovieGrid
            movies={tvShows}
            currentPage={page}
            totalPages={total_pages > 100 ? 100 : total_pages}
            baseUrl="/series"
            currentFilters={params}
            mediaType="tv"
          />
        </Suspense>
      </div>
    </main>
  );
}
