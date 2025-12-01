import { getCollectionById, FEATURED_UNIVERSES } from "@/services/collections-api";
import { getMovieDetails, getWatchProviders } from "@/services/tmdb-api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Film, Sparkles, Star, Calendar, Clock, PlayCircle } from "lucide-react";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";
import EnhancedStreamingProviders from "@/components/EnhancedStreamingProviders";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const revalidate = 3600; // Cache de 1 hora

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const routeParams = await params;
  const id = parseInt(routeParams.id);

  if (isNaN(id)) {
    notFound();
  }

  const collection = await getCollectionById(id);

  if (!collection || collection.movies.length === 0) {
    notFound();
  }

  // Buscar o config para pegar a descrição personalizada e nome correto
  const config = FEATURED_UNIVERSES.find((c) => c.id === id);
  const description = config?.description || collection.overview;
  
  // Usar o nome do config se disponível (evita nomes com parênteses da API)
  const collectionName = config?.name || collection.name;

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

  // Ordenar filmes por data de lançamento
  const sortedMovies = [...collection.movies].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Calcular estatísticas da coleção
  const validRatings = sortedMovies.filter(m => m.vote_average && m.vote_average > 0);
  const averageRating = validRatings.length > 0
    ? validRatings.reduce((sum, movie) => sum + (movie.vote_average || 0), 0) / validRatings.length
    : 0;
  
  const releaseDates = sortedMovies
    .map(m => m.release_date ? new Date(m.release_date) : null)
    .filter(Boolean) as Date[];
  
  const firstRelease = releaseDates.length > 0 ? new Date(Math.min(...releaseDates.map(d => d.getTime()))) : null;
  const lastRelease = releaseDates.length > 0 ? new Date(Math.max(...releaseDates.map(d => d.getTime()))) : null;
  
  const yearsSpan = firstRelease && lastRelease 
    ? `${firstRelease.getFullYear()} - ${lastRelease.getFullYear()}`
    : firstRelease 
    ? firstRelease.getFullYear().toString()
    : "N/A";

  // Buscar informações de streaming do primeiro filme (como referência)
  let streamingProviders = null;
  try {
    if (sortedMovies.length > 0) {
      const firstMovieDetails = await getMovieDetails(sortedMovies[0].id);
      streamingProviders = await getWatchProviders(sortedMovies[0].id, "movie");
    }
  } catch (error) {
    console.error("Error fetching streaming providers:", error);
  }

  return (
    <main>
      <LoadingReset />

      {/* Hero Section com Backdrop */}
      {backdropUrl && (
        <div className="relative h-[60vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
          <Image
            src={backdropUrl}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="relative z-20 px-4 md:px-8 max-w-7xl mx-auto -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          {posterUrl && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-[200px] md:w-[300px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={posterUrl}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Informações da Coleção */}
          <div className="flex-1 space-y-6 pb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-red-500" />
                  <Badge variant="outline" className="text-sm">
                    {collection.type === "tmdb-collection"
                      ? "Coleção"
                      : collection.type === "company"
                      ? "Universo"
                      : "Franchise"}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
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

            {/* Informações básicas - Layout original */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                <span className="font-medium text-white">
                  {collection.movies.length} filme
                  {collection.movies.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-white">
                  {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium text-white">{yearsSpan}</span>
              </div>
            </div>

            {/* Estatísticas extras - Abaixo, mesmo layout */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Avaliação Média:</span>
                <span className="font-medium text-white">
                  {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Anos de Produção:</span>
                <span className="font-medium text-white">
                  {firstRelease && lastRelease && firstRelease.getFullYear() !== lastRelease.getFullYear()
                    ? `${lastRelease.getFullYear() - firstRelease.getFullYear()} anos`
                    : "1 ano"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seções em Accordion */}
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Timeline dos Filmes */}
            <AccordionItem value="timeline" className="bg-gray-900/50 rounded-xl px-6 border-none">
              <AccordionTrigger className="text-xl font-bold hover:no-underline">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  Linha do Tempo
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {sortedMovies.map((movie, index) => {
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
                          <div className="text-xs text-gray-400">{releaseYear}</div>
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
                        <div className="flex items-center gap-1">
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

            {/* Onde Assistir */}
            {streamingProviders && (
              <AccordionItem value="streaming" className="bg-gray-900/50 rounded-xl px-6 border-none">
                <AccordionTrigger className="text-xl font-bold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-red-500" />
                    Onde Assistir
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-gray-400 mb-4 text-sm">
                      Plataformas onde você pode assistir os filmes desta coleção (baseado em disponibilidade no Brasil)
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

        {/* Grid de Filmes */}
        <div className="mt-12 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Todos os Filmes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sortedMovies.map((movie) => (
              <Link
                key={movie.id}
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

                  {/* Overlay com informações */}
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

                    {/* Sinopse */}
                    {movie.overview && (
                      <div className="mt-2 max-h-0 group-hover:max-h-20 transition-all duration-300 overflow-hidden">
                        <p className="text-xs text-gray-300 line-clamp-3">
                          {movie.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-medium line-clamp-2">
                  {movie.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

