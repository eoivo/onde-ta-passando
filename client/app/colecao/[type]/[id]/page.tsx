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
  Star,
  Calendar,
  Clock,
  PlayCircle,
  Globe,
  Clapperboard,
  ArrowRight,
} from "lucide-react";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";
import EnhancedStreamingProviders from "@/components/EnhancedStreamingProviders";
import Pagination from "@/components/Pagination";
import MovieCard from "@/components/MovieCard";
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
    ? `https://image.tmdb.org/t/p/w780${collection.poster_path}`
    : collection.movies[0]?.poster_path
    ? `https://image.tmdb.org/t/p/w780${collection.movies[0].poster_path}`
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
            unoptimized={true}
          />
        </div>
      )}

      <div className="relative z-20 px-4 md:px-8 max-w-7xl mx-auto -mt-[35vh] md:-mt-[38vh] pt-0 md:pt-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Poster */}
          {posterUrl && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-[200px] md:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
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
          <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left space-y-5 pb-4 md:pb-8 w-full">
            <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 px-3 rounded-full bg-red-600/15 border border-red-500/30 inline-flex items-center gap-1.5 text-red-400 text-[11px] font-bold uppercase tracking-wider leading-none">
                    <CategoryIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>{categoryMeta.label}</span>
                  </div>
                </div>
                <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-wider leading-none drop-shadow-lg">
                  {collectionName}
                </h1>
              </div>
              <ShareButton title={collectionName} />
            </div>

            {description && (
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-neutral-300">
              <div className="h-8 px-3.5 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full inline-flex items-center gap-2 leading-none">
                <Film className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold text-white text-[11px] uppercase tracking-wider leading-none">
                  {totalVisibleResults} {totalVisibleResults !== 1 ? "filmes" : "filme"}
                </span>
              </div>
              {averageRating > 0 && (
                <div className="h-8 px-3.5 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full inline-flex items-center gap-1.5 leading-none">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-white text-[11px] uppercase tracking-wider leading-none">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="h-8 px-3.5 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full inline-flex items-center gap-2 leading-none">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-bold text-white text-[11px] uppercase tracking-wider leading-none">
                  {yearsSpan}
                </span>
              </div>
              
              {firstRelease && lastRelease && category === "saga" && (
                <div className="h-8 px-3.5 bg-red-600/10 backdrop-blur-md border border-red-500/25 rounded-full inline-flex items-center gap-2 leading-none">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-bold text-red-400 text-[11px] uppercase tracking-wider leading-none">
                    {lastRelease.getFullYear() - firstRelease.getFullYear() > 0
                      ? `${lastRelease.getFullYear() - firstRelease.getFullYear()} ANOS DE SAGA`
                      : "1 ANO DE SAGA"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acordeões */}
        <div className="mt-10">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Linha do Tempo — apenas para Sagas */}
            {category === "saga" && (
              <AccordionItem
                value="timeline"
                className="bg-white/[0.03] backdrop-blur-xl rounded-3xl px-5 md:px-8 border border-white/10 overflow-hidden transition-colors duration-300 data-[state=open]:border-white/20 transform-gpu translate-z-0"
              >
                <AccordionTrigger className="py-5 text-xl font-normal font-bebas tracking-wider hover:no-underline group uppercase cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span className="text-2xl text-white">Linha do Tempo</span>
                    <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-sans font-semibold text-neutral-300 inline-flex items-center leading-none">
                      {allMovies.length} filmes
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2.5 pb-6 pt-2">
                    {allMovies.map((movie, index) => {
                      const releaseYear = movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : "N/A";
                      return (
                        <Link
                          key={movie.id}
                          href={`/filme/${movie.id}`}
                          className="flex items-center gap-3.5 md:gap-5 p-3 md:p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-white/25 transition-colors duration-200 group"
                        >
                          <div className="flex-shrink-0 w-12 md:w-14 text-center border-r border-white/10 pr-2">
                            <div className="text-2xl md:text-3xl font-normal font-bebas text-red-500 leading-none">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className="text-[10px] font-bold uppercase text-neutral-400 mt-1">
                              {releaseYear}
                            </div>
                          </div>

                          {movie.poster_path && (
                            <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 bg-neutral-900">
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors text-sm md:text-base truncate">
                              {movie.title}
                            </h3>
                            {movie.overview && (
                              <p className="text-xs md:text-[13px] text-neutral-400 line-clamp-1 mt-0.5">
                                {movie.overview}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="h-7 px-2.5 rounded-full bg-white/[0.05] border border-white/10 inline-flex items-center gap-1 leading-none">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-bold text-white leading-none">
                                {movie.vote_average?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                            <span className="hidden sm:flex w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 group-hover:bg-white/[0.12] group-hover:border-white/25 items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                              <ArrowRight className="w-3.5 h-3.5" />
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
                className="bg-white/[0.03] backdrop-blur-xl rounded-3xl px-5 md:px-8 border border-white/10 overflow-hidden transition-colors duration-300 data-[state=open]:border-white/20 transform-gpu translate-z-0"
              >
                <AccordionTrigger className="py-5 text-xl font-normal font-bebas tracking-wider hover:no-underline group uppercase cursor-pointer">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-red-500" />
                    <span className="text-2xl text-white">Onde Assistir</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-6 pt-2">
                    <p className="text-neutral-400 mb-6 text-sm leading-relaxed max-w-2xl">
                      Confira as plataformas de streaming onde os filmes principais desta saga estão disponíveis no Brasil:
                    </p>
                    <EnhancedStreamingProviders
                      providers={streamingProviders}
                      title={collectionName}
                      tmdbId={sortedMovies[0]?.id}
                      mediaType="movie"
                      hideHeader={true}
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
              <div className="space-y-14">
                {collection.groups.map((group, idx) => (
                  <section key={idx} className="scroll-mt-24">
                    <div className="mb-6 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                          {group.name}
                        </h2>
                        <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                          {group.movies.length} filmes
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-neutral-400 mt-1.5 text-xs md:text-sm max-w-4xl">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                      {group.movies.map((movie, mIdx) => (
                        <MovieCard
                          key={movie.id}
                          movie={{ ...(movie as any), media_type: "movie" }}
                          index={mIdx}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* RENDERIZAÇÃO PADRÃO (Lista única) */
              <>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                  <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                    {moviesLabel}
                  </h2>
                  <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                    {totalVisibleResults} filmes
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {sortedMovies.map((movie, mIdx) => (
                    <MovieCard
                      key={movie.id}
                      movie={{ ...(movie as any), media_type: "movie" }}
                      index={mIdx}
                    />
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
                <div className="mb-6 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                      Franquias
                    </h2>
                    <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                      {franchises.length} coleções
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-neutral-400 mt-1">
                    Coleções que compõem este universo
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {franchises.map((franchise, i) => (
                    <FranchiseCard key={franchise.id} franchise={franchise} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Filmes Solo */}
            {soloFilms.length > 0 && (
              <div className="mt-12 pb-12">
                <div className="mb-6 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                      Filmes Solo
                    </h2>
                    <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                      {soloFilms.length} filmes
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-neutral-400 mt-1">
                    Filmes que não fazem parte de uma franquia específica
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {soloFilms.map((movie, mIdx) => (
                    <MovieCard
                      key={movie.id}
                      movie={{ ...(movie as any), media_type: "movie" }}
                      index={mIdx}
                    />
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
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
                  <h2 className="font-bebas text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                    {moviesLabel}
                  </h2>
                  <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-neutral-300 inline-flex items-center leading-none">
                    {totalVisibleResults} filmes
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {sortedMovies.map((movie, mIdx) => (
                    <MovieCard
                      key={movie.id}
                      movie={{ ...(movie as any), media_type: "movie" }}
                      index={mIdx}
                    />
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

/** Card de franquia (landscape) — links para /colecao/saga/[id] */
function FranchiseCard({
  franchise,
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
      className="w-full aspect-video rounded-xl overflow-hidden relative group shadow-lg bg-neutral-900 border border-white/10 hover:border-white/25 transition-all duration-300 block"
    >
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={franchise.name}
          fill
          quality={80}
          sizes="400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
          <span className="text-neutral-500 text-xs text-center px-3">
            {franchise.name}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-normal font-bebas text-xl uppercase tracking-wider text-white leading-tight truncate group-hover:text-red-400 transition-colors">
            {franchise.name}
          </h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            {franchise.movies.length} filmes
          </p>
        </div>
        <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
