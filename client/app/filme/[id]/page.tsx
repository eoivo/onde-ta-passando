import {
  getMovieDetails,
  getMovieCredits,
  getWatchProviders,
  getMovieVideos,
} from "@/services/tmdb-api";
import Image from "next/image";
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
import SintonizeButton from "@/components/SintonizeButton";

export const dynamicParams = true;
export const revalidate = 0;

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

  return (
    <main>
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal font-bebas tracking-tighter text-white drop-shadow-2xl uppercase leading-[0.8]">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
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

              {(() => {
                const originalMapping = [
                  { names: ["Netflix"], label: "Original da Netflix", color: "text-red-600", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
                  { names: ["Amazon Studios", "Amazon MGM Studios"], label: "Original da Amazon", color: "text-blue-400", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
                  { names: ["Disney+", "Disney Plus"], label: "Original Disney+", color: "text-blue-600", logo: "https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg" },
                  { names: ["HBO", "MAX", "Max"], label: "Original HBO", color: "text-purple-400", logo: "https://image.tmdb.org/t/p/original/jbe4gVSfRlbPTdESXhEKpornsfu.jpg" },
                  { names: ["Apple TV+", "Apple TV"], label: "Original Apple TV+", color: "text-gray-200", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
                  { names: ["Globoplay"], label: "Original Globoplay", color: "text-pink-500", logo: "https://image.tmdb.org/t/p/original/7Cg8esVVXOijXAm1f1vrS7jVjcN.jpg" },
                  { names: ["Paramount+"], label: "Original Paramount+", color: "text-blue-500", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitnhR8xLG1QymTE.jpg" },
                ];

                const producer = movie.production_companies?.find((pc: any) =>
                  originalMapping.some(m => m.names.includes(pc.name))
                );

                if (!producer) return null;

                const info = originalMapping.find(m => m.names.includes(producer.name));
                if (!info) return null;

                return (
                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-6 group hover:bg-black/60 transition-colors duration-300">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src={info.logo}
                        alt={info.label}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className={`${info.color} font-bold text-[10px] tracking-[0.2em] uppercase`}>
                      {info.label}
                    </span>
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-2 items-center">
                {movie.genres.map((genre: any) => (
                  <Badge key={genre.id} variant="outline" className="text-sm">
                    {genre.name}
                  </Badge>
                ))}

                <div className="flex items-center gap-1 ml-2">
                  <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Clock className="w-4 h-4" />
                  <span>{formattedRuntime}</span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Calendar className="w-4 h-4" />
                  <span>{releaseDate}</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-200 leading-relaxed max-w-4xl font-light italic">
              {movie.overview}
            </p>

            <div className="flex flex-col gap-3 items-stretch md:items-start">
              {videos.length > 0 && (
                <VideoPlayer videos={videos} btnWidth="md:w-[280px]" />
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

        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-normal font-bebas mb-6 uppercase tracking-wider text-red-600/90 flex items-center gap-3">
            <span className="w-8 h-px bg-red-600/30" />
            Elenco principal
          </h2>
          <CastCarousel cast={credits.cast.slice(0, 10)} />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-normal font-bebas mb-6 uppercase tracking-wider text-red-600/90 flex items-center gap-3">
            <span className="w-8 h-px bg-red-600/30" />
            Recomendações
          </h2>
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
