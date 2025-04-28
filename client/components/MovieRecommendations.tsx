import {
  getMovieRecommendations,
  getTvRecommendations,
} from "@/services/tmdb-api";
import MovieCarousel from "./MovieCarousel";

interface MovieRecommendationsProps {
  movieId: string;
  mediaType?: "movie" | "tv";
}

export default async function MovieRecommendations({
  movieId,
  mediaType = "movie",
}: MovieRecommendationsProps) {
  const recommendations =
    mediaType === "movie"
      ? await getMovieRecommendations(movieId)
      : await getTvRecommendations(movieId);

  if (recommendations.length === 0) {
    return <p className="text-gray-400">Nenhuma recomendação disponível.</p>;
  }

  interface MovieItem {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average: number;
    overview: string;
    release_date?: string;
    first_air_date?: string;
  }

  const recommendationsWithType = recommendations.map((item: MovieItem) => ({
    ...item,
    media_type: mediaType,
  }));

  return <MovieCarousel title="" movies={recommendationsWithType} />;
}
