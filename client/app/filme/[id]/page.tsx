import {
  getMovieDetails,
  getMovieCredits,
  getWatchProviders,
  getMovieVideos,
} from "@/services/tmdb-api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StarIcon, Clock, Calendar } from "lucide-react";
import StreamingProviders from "@/components/StreamingProviders";
import CastCarousel from "@/components/CastCarousel";
import MovieRecommendations from "@/components/MovieRecommendations";
import VideoPlayer from "@/components/VideoPlayer";
import { Suspense } from "react";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";
import DynamicMediaActions from "@/components/DynamicMediaActions";
import EnhancedStreamingProviders from "@/components/EnhancedStreamingProviders";
import MovieChatBot from "@/components/MovieChatBot";
import { MovieContext } from "@/services/gemini-api";
import type { Metadata } from "next";
import SintonizeButton from "@/components/SintonizeButton";

export const dynamicParams = true;
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  try {
    const routeParams = await params;
    const movie = await getMovieDetails(routeParams.id);
    if (!movie || !movie.title) {
      return { title: "Filme" };
    }

    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : "";
    const titleWithYear = year && !isNaN(year) ? `${movie.title} (${year})` : movie.title;
    const pageTitle = `Onde assistir ${titleWithYear} no streaming`;
    const description =
      movie.overview?.slice(0, 160) ||
      `Descubra em quais plataformas de streaming no Brasil o filme ${titleWithYear} está disponível para assistir.`;
    const ogImage = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : "/images/logos/icon_full_name.png";

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: `/filme/${routeParams.id}`,
      },
      openGraph: {
        type: "video.movie",
        title: `${pageTitle} | Onde Tá Passando?`,
        description,
        url: `/filme/${routeParams.id}`,
        images: [{ url: ogImage, width: 1280, height: 720, alt: movie.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${pageTitle} | Onde Tá Passando?`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Filme" };
  }
}

export default async function MoviePage({
  params,
}: {
  params: { id: string };
}) {
  const routeParams = await params;
  const id = routeParams.id;
  const movie = await getMovieDetails(id);
  const credits = await getMovieCredits(id);
  const watchProviders = await getWatchProviders(id, "movie");
  const streamingServices = watchProviders.results?.BR?.flatrate?.map((p: any) => p.provider_name) || [];
  const videos = await getMovieVideos(id);

  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const formattedRuntime = `${hours}h ${minutes}m`;

  const releaseDate = new Date(movie.release_date).toLocaleDateString("pt-BR");

  // Preparar contexto para o chat bot
  const movieContext: MovieContext = {
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.release_date,
    genres: movie.genres.map((g: any) => g.name),
    cast: credits.cast.slice(0, 10).map((actor: any) => actor.name),
    director: credits.crew.find((person: any) => person.job === "Director")
      ?.name,
    mediaType: "movie",
    rating: movie.vote_average,
    streamingServices: streamingServices,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    image: movie.poster_path
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : undefined,
    datePublished: movie.release_date || undefined,
    genre: movie.genres?.map((g: any) => g.name) || [],
    director: movieContext.director
      ? { "@type": "Person", name: movieContext.director }
      : undefined,
    aggregateRating:
      movie.vote_average && movie.vote_count
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(movie.vote_average.toFixed(1)),
            bestRating: 10,
            ratingCount: movie.vote_count,
          }
        : undefined,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoadingReset />

      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
      </div>

      <div className="relative z-20 -mt-[70vh] md:-mt-[62vh] px-4 md:px-12 max-w-[1600px] mx-auto pt-0 md:pt-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={350}
              height={525}
              className="rounded-2xl shadow-2xl border border-white/10 hidden lg:block"
              priority
            />
          </div>

          <div className="flex-1 space-y-8 pt-0 md:pt-10">
            <div className="space-y-4">
              {(() => {
                const originalMapping = [
                  { names: ["Netflix"], brand: "Netflix", color: "text-red-500", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg", providerIds: [8, 1796] },
                  { names: ["Prime Video", "Amazon Prime Video", "Amazon Studios", "Amazon MGM Studios", "Amazon"], brand: "Prime Video", color: "text-sky-400", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg", providerIds: [119, 9] },
                  { names: ["Disney+", "Disney Plus"], brand: "Disney+", color: "text-blue-500", logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg", providerIds: [337] },
                  { names: ["HBO", "HBO Max", "HBO Films", "MAX", "Max"], brand: "HBO", color: "text-purple-400", logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg", providerIds: [384, 1899] },
                  { names: ["Apple TV+", "Apple TV", "Apple Original Films", "Apple Studios"], brand: "Apple TV+", color: "text-gray-200", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg", providerIds: [350] },
                  { names: ["Globoplay", "Estúdios Globo"], brand: "Globoplay", color: "text-pink-500", logo: "https://image.tmdb.org/t/p/original/7Cg8esVVXOijXAm1f1vrS7jVjcN.jpg", providerIds: [307] },
                  { names: ["Paramount+", "Paramount Plus", "Paramount Players"], brand: "Paramount+", color: "text-blue-500", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg", providerIds: [531] },
                ];

                const companies: any[] = movie.production_companies || [];
                const brFlatrate: any[] = watchProviders?.results?.BR?.flatrate || [];

                const info = originalMapping.find(
                  (m) =>
                    companies.some((pc) => m.names.includes(pc.name)) &&
                    (brFlatrate.length === 0 || brFlatrate.some((p) => m.providerIds.includes(p.provider_id)))
                );
                if (!info) return null;

                return (
                  <div className="inline-flex items-center gap-2">
                    <div className="relative w-4 h-4 rounded-[3px] overflow-hidden flex-shrink-0">
                      <Image
                        src={info.logo}
                        alt={`Original ${info.brand}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-neutral-300 font-bold text-[11px] tracking-[0.24em] uppercase leading-none">
                      Original <strong className={`${info.color} font-extrabold`}>{info.brand}</strong>
                    </span>
                  </div>
                );
              })()}

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal font-bebas tracking-tighter text-white drop-shadow-2xl uppercase leading-[0.8] max-w-4xl">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 lg:mt-2">
                  <DynamicMediaActions
                    mediaId={id}
                    mediaType="movie"
                    title={movie.title}
                    posterPath={movie.poster_path}
                  />
                  <SintonizeButton id={id} mediaType="movie" />
                  <ShareButton title={movie.title} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {movie.genres.map((genre: any) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="h-7 px-3 py-0 bg-white/5 border-white/15 text-white/90 text-xs font-medium leading-none inline-flex items-center justify-center"
                  >
                    {genre.name}
                  </Badge>
                ))}

                <div className="flex items-center gap-1.5 ml-2 text-sm text-neutral-200">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-2 text-sm text-neutral-200">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{formattedRuntime}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2 text-sm text-neutral-200">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>{releaseDate}</span>
                </div>
              </div>
            </div>

            <p className="text-base md:text-[17px] text-neutral-100/90 leading-[1.65] max-w-3xl font-normal">
              {movie.overview}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
              {videos.length > 0 && (
                <VideoPlayer videos={videos} btnWidth="sm:w-auto" />
              )}

              {/* Chat Bot */}
              <MovieChatBot movieContext={movieContext} />
            </div>

            <div className="pt-4">
              <EnhancedStreamingProviders
                providers={watchProviders}
                title={movie.title}
                tmdbId={id}
                imdbId={movie.imdb_id}
                mediaType="movie"
              />
            </div>
          </div>
        </div>

        {credits.cast && credits.cast.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-2xl md:text-3xl font-normal font-bebas uppercase tracking-wider text-white leading-none">
                Elenco Principal
              </h2>
              <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 inline-flex items-center leading-none">
                {Math.min(credits.cast.length, 18)} {Math.min(credits.cast.length, 18) === 1 ? "ator" : "atores"}
              </span>
            </div>
            <CastCarousel cast={credits.cast.slice(0, 18)} />
          </div>
        )}

        <div className="mt-16">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-2xl md:text-3xl font-normal font-bebas uppercase tracking-wider text-white leading-none">
              Recomendações
            </h2>
            <Link
              href={`/sintonia?id=${id}&type=movie`}
              className="h-8 px-3.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-red-600/15 hover:border-red-500/45 text-neutral-300 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 text-red-500"
                aria-hidden="true"
              >
                <path d="M2 10v3" />
                <path d="M6 6v11" />
                <path d="M10 3v18" />
                <path d="M14 8v7" />
                <path d="M18 5v13" />
                <path d="M22 10v3" />
              </svg>
              <span>Ver mais na Sintonia</span>
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
              </div>
            }
          >
            <MovieRecommendations movieId={id} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
