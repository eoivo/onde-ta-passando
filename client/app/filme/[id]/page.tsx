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
  const videos = await getMovieVideos(id);

  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const formattedRuntime = `${hours}h ${minutes}m`;

  const releaseDate = new Date(movie.release_date).toLocaleDateString("pt-BR");

  // Preparar contexto para o chat bot
  const movieContext: MovieContext = {
    title: movie.title,
    overview: movie.overview,
    releaseDate: releaseDate,
    genres: movie.genres.map((g: any) => g.name),
    cast: credits.cast.slice(0, 10).map((actor: any) => actor.name),
    director: credits.crew.find((person: any) => person.job === "Director")
      ?.name,
    mediaType: "movie",
    rating: movie.vote_average,
  };

  return (
    <main>
      <LoadingReset />

      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-20 -mt-80 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded-lg shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold">{movie.title}</h1>
              <div className="flex items-center gap-2">
                <DynamicMediaActions
                  mediaId={id}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path}
                />
                <ShareButton title={movie.title} />
              </div>
            </div>

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

            <p className="text-lg text-gray-300">{movie.overview}</p>

            {videos.length > 0 && (
              <div className="pt-2">
                <VideoPlayer videos={videos} />
              </div>
            )}

            {/* Chat Bot */}
            <div className="pt-4">
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
          <h2 className="text-2xl font-semibold mb-4">Elenco principal</h2>
          <CastCarousel cast={credits.cast.slice(0, 10)} />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4">Recomendações</h2>
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
