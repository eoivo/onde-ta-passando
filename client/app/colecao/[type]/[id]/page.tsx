import {
  getCollectionByIdAndCategory,
  getUniverseFranchises,
  ALL_FEATURED,
  CollectionCategory,
  UnifiedCollection,
  CollectionMovie,
} from "@/services/collections-api";
import { getWatchProviders } from "@/services/tmdb-api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Film,
  Sparkles,
  Star,
  Calendar,
  Clock,
  PlayCircle,
  Globe,
  Clapperboard,
} from "lucide-react";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";
import EnhancedStreamingProviders from "@/components/EnhancedStreamingProviders";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  CollectionCategory,
  { label: string; icon: typeof Film }
> = {
  saga: { label: "Saga", icon: Film },
  universo: { label: "Universo", icon: Globe },
  estudio: { label: "Estúdio", icon: Clapperboard },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type, id } = await params;
  const { page } = await searchParams;
  const numId = parseInt(id);
  const currentPage = parseInt(page || "1");

  const validTypes: CollectionCategory[] = ["saga", "universo", "estudio"];
  if (!validTypes.includes(type as CollectionCategory)) {
    notFound();
  }

  const category = type as CollectionCategory;
  const decodedId = decodeURIComponent(id);
  const collection = await getCollectionByIdAndCategory(
    decodedId,
    category,
    currentPage
  );

  if (!collection || collection.movies.length === 0) {
    notFound();
  }

  // Buscar config para descrição personalizada e franquias
  const config = ALL_FEATURED.find((c) => c.id.toString() === decodedId);
  const description = config?.description || collection.overview;
  const collectionName = config?.name || collection.name;

  // Imagens
  const backdropUrl = collection.backdrop_path
    ? `https://image.tmdb.org/t/p/original${collection.backdrop_path}`
    : collection.movies[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${collection.movies[0].backdrop_path}`
    : null;

  const posterUrl = collection.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
    : collection.movies[0]?.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.movies[0].poster_path}`
    : null;

  // Para sagas: ordenar cronologicamente (antigo ao novo)
  // Para outros: por popularidade/data (já vem ordenado conforme configuramos no serviço)
  const allMovies =
    category === "saga"
      ? [...collection.movies].sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateA - dateB;
        })
      : collection.movies;

  // Paginação local para Sagas (para manter consistência de 20 por página)
  const itemsPerPage = 20;
  const totalResults = category === "saga" ? allMovies.length : (collection.total_results || allMovies.length);
  const totalPages = category === "saga" ? Math.ceil(allMovies.length / itemsPerPage) : (collection.total_pages || 1);
  
  const sortedMovies = category === "saga" 
    ? allMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : allMovies;

  // Estatísticas (baseadas em todos os filmes da saga para precisão, não só na página)
  const statsMovies = category === "saga" ? allMovies : allMovies;
  const validRatings = statsMovies.filter(
    (m) => m.vote_average && m.vote_average > 0
  );
  const averageRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, m) => sum + (m.vote_average || 0), 0) /
        validRatings.length
      : 0;

  const releaseDates = statsMovies
    .map((m) => (m.release_date ? new Date(m.release_date) : null))
    .filter(Boolean) as Date[];

  const firstRelease =
    releaseDates.length > 0
      ? new Date(Math.min(...releaseDates.map((d) => d.getTime())))
      : null;
  const lastRelease =
    releaseDates.length > 0
      ? new Date(Math.max(...releaseDates.map((d) => d.getTime())))
      : null;

  const yearsSpan =
    firstRelease && lastRelease
      ? `${firstRelease.getFullYear()} – ${lastRelease.getFullYear()}`
      : firstRelease
      ? firstRelease.getFullYear().toString()
      : "N/A";

  // Streaming providers (apenas para sagas — referência pelo primeiro filme)
  let streamingProviders = null;
  if (category === "saga" && sortedMovies.length > 0) {
    try {
      streamingProviders = await getWatchProviders(sortedMovies[0].id, "movie");
    } catch {}
  }

  // Para universos: buscar franquias (sub-saðas) e calcular filmes solo
  let franchises: UnifiedCollection[] = [];
  let soloFilms: CollectionMovie[] = sortedMovies;

  if (category === "universo" && config?.franchises && config.franchises.length > 0) {
    franchises = await getUniverseFranchises(config.franchises);
    const franchiseMovieIds = new Set(
      franchises.flatMap((f) => f.movies.map((m) => m.id))
    );
    soloFilms = sortedMovies.filter((m) => !franchiseMovieIds.has(m.id));
  }

  const categoryMeta = CATEGORY_META[category];
  const CategoryIcon = categoryMeta.icon;

  // Labels adaptativos e cálculo de total real para universos
  let totalVisibleResults = totalResults;
  
  if (category === "universo") {
    // Somamos os filmes únicos das franquias + filmes solo
    const uniqueFranchiseMovieIds = new Set(
      franchises.flatMap((f) => f.movies.map((m) => m.id))
    );
    totalVisibleResults = uniqueFranchiseMovieIds.size + soloFilms.length;
  }

  const moviesLabel =
    category === "saga"
      ? "Saga Completa"
      : category === "universo"
      ? "Títulos do Universo"
      : "Filmografia";

  return (
    <main>
      <LoadingReset />

      {/* Hero Section */}
      {backdropUrl && (
        <div className="relative h-[50vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
          <Image
            src={backdropUrl}
            alt={collectionName}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="relative z-20 px-4 md:px-8 max-w-7xl mx-auto -mt-56 md:-mt-[38vh] pt-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          {posterUrl && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-[200px] md:w-[300px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={posterUrl}
                  alt={collectionName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-6 pb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryIcon className="w-5 h-5 text-red-500" />
                  <Badge variant="outline" className="text-sm">
                    {categoryMeta.label}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {collectionName}
                </h1>
              </div>
              <ShareButton title={collectionName} />
            </div>

            {description && (
              <p className="text-lg text-gray-300 leading-relaxed">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                <span className="font-medium text-white">
                  {totalVisibleResults} filme
                  {totalVisibleResults !== 1 ? "s" : ""}
                </span>
              </div>
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-white">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium text-white">{yearsSpan}</span>
              </div>
            </div>

            {firstRelease && lastRelease && category === "saga" && (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm text-gray-500">Duração da saga:</span>
                <span className="font-medium text-white">
                  {lastRelease.getFullYear() - firstRelease.getFullYear() > 0
                    ? `${lastRelease.getFullYear() - firstRelease.getFullYear()} anos`
                    : "1 ano"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acordeões */}
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Linha do Tempo — apenas para Sagas */}
            {category === "saga" && (
              <AccordionItem
                value="timeline"
                className="bg-gray-900/50 rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-xl font-bold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    Linha do Tempo
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {allMovies.map((movie, index) => {
                      const releaseYear = movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "N/A";
                      return (
                        <Link
                          key={movie.id}
                          href={`/filme/${movie.id}`}
                          className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex-shrink-0 w-12 text-center">
                            <div className="text-xl font-bold text-red-500">
                              {index + 1}
                            </div>
                            <div className="text-xs text-gray-400">
                              {releaseYear}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-red-500 transition-colors text-sm md:text-base">
                              {movie.title}
                            </h3>
                            {movie.overview && (
                              <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                                {movie.overview}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium">
                              {movie.vote_average?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Onde Assistir — apenas para Sagas */}
            {category === "saga" && streamingProviders && (
              <AccordionItem
                value="streaming"
                className="bg-gray-900/50 rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-xl font-bold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-red-500" />
                    Onde Assistir
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-gray-400 mb-4 text-sm">
                      Plataformas onde você pode assistir os filmes desta saga
                      (baseado em disponibilidade no Brasil)
                    </p>
                    <EnhancedStreamingProviders
                      providers={streamingProviders}
                      title={collectionName}
                      tmdbId={sortedMovies[0]?.id}
                      mediaType="movie"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        {/* Grid de Filmes ou Mega-Saga Organizada */}
        {(category === "saga" || category === "estudio") && (
          <div className="mt-12 pb-12">
            {collection.groups && collection.groups.length > 0 ? (
              /* RENDERIZAÇÃO DE MEGA-SAGA (Agrupada por Eras) */
              <div className="space-y-16">
                {collection.groups.map((group, idx) => (
                  <section key={idx} className="scroll-mt-24">
                    <div className="mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-red-600 rounded-full" />
                        {group.name}
                      </h2>
                      {group.description && (
                        <p className="text-gray-400 mt-2 text-sm md:text-base max-w-4xl">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                      {group.movies.map((movie) => (
                        <MovieGridItem key={movie.id} movie={movie} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* RENDERIZAÇÃO PADRÃO (Lista única) */
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {moviesLabel}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {sortedMovies.map((movie) => (
                    <MovieGridItem key={movie.id} movie={movie} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/colecao/${type}/${id}`}
                  currentFilters={{}}
                />
              </>
            )}
          </div>
        )}

        {/* UNIVERSO: Franquias + Filmes Solo */}
        {category === "universo" && (
          <>
            {/* Seção de Franquias */}
            {franchises.length > 0 && (
              <div className="mt-10">
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Franquias</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Coleções que compõem este universo
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {franchises.map((franchise, i) => (
                    <FranchiseCard key={franchise.id} franchise={franchise} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Filmes Solo */}
            {soloFilms.length > 0 && (
              <div className="mt-12 pb-12">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold">Filmes Solo</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Filmes que não fazem parte de uma franquia específica
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {soloFilms.map((movie) => (
                    <MovieGridItem key={movie.id} movie={movie} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/colecao/${type}/${id}`}
                  currentFilters={{}}
                />
              </div>
            )}

            {/* Fallback: nenhuma franquia mapeada, mostrar tudo */}
            {franchises.length === 0 && (
              <div className="mt-12 pb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  {moviesLabel}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {sortedMovies.map((movie) => (
                    <MovieGridItem key={movie.id} movie={movie} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/colecao/${type}/${id}`}
                  currentFilters={{}}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes locais
// ---------------------------------------------------------------------------

/** Card de poster para grids de filmes */
function MovieGridItem({ movie }: { movie: CollectionMovie }) {
  return (
    <Link
      href={`/filme/${movie.id}`}
      className="group transition-transform hover:scale-105 duration-200"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">
              {movie.title}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">
              {movie.vote_average?.toFixed(1) || "N/A"}
            </span>
          </div>
          <p className="text-xs text-gray-300">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </p>
        </div>
      </div>
      <h3 className="mt-2 text-sm font-medium line-clamp-2">{movie.title}</h3>
    </Link>
  );
}

/** Card de franquia (landscape) — links para /colecao/saga/[id] */
function FranchiseCard({
  franchise,
  index,
}: {
  franchise: UnifiedCollection;
  index: number;
}) {
  const backdropUrl = franchise.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${franchise.backdrop_path}`
    : franchise.movies[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${franchise.movies[0].backdrop_path}`
    : null;

  return (
    <Link
      href={`/colecao/saga/${franchise.id}`}
      className="w-full aspect-video rounded-xl overflow-hidden relative group shadow-md block"
    >
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={franchise.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <span className="text-gray-600 text-xs text-center px-3">
            {franchise.name}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-normal font-bebas text-lg uppercase tracking-wide text-white leading-tight line-clamp-1">
          {franchise.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {franchise.movies.length} filmes
        </p>
      </div>

      <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-red-600/40 transition-all duration-300 pointer-events-none" />
    </Link>
  );
}
