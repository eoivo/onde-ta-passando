import {
  getTvDetails,
  getTvCredits,
  getWatchProviders,
  getTvVideos,
} from "@/services/tmdb-api";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { StarIcon, Calendar } from "lucide-react";
import StreamingProviders from "@/components/StreamingProviders";
import CastCarousel from "@/components/CastCarousel";
import MovieRecommendations from "@/components/MovieRecommendations";
import VideoPlayer from "@/components/VideoPlayer";
import { Suspense } from "react";
import LoadingReset from "@/components/LoadingReset";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function TVShowPage({
  params,
}: {
  params: { id: string };
}) {
  const routeParams = await params;
  const id = routeParams.id;
  const tvShow = await getTvDetails(id);
  const credits = await getTvCredits(id);
  const watchProviders = await getWatchProviders(id, "tv");
  const videos = await getTvVideos(id);

  const firstAirDate = tvShow.first_air_date
    ? new Date(tvShow.first_air_date).toLocaleDateString("pt-BR")
    : "Data desconhecida";

  const statusMap: Record<string, string> = {
    "Returning Series": "Em exibição",
    Ended: "Finalizada",
    Canceled: "Cancelada",
    "In Production": "Em produção",
  };

  const status = statusMap[tvShow.status] || tvShow.status;

  return (
    <main>
      <LoadingReset />

      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        <Image
          src={`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`}
          alt={tvShow.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-20 -mt-80 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
              alt={tvShow.name}
              width={300}
              height={450}
              className="rounded-lg shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl md:text-5xl font-bold">{tvShow.name}</h1>
              <ShareButton title={tvShow.name} />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {tvShow.genres.map((genre: any) => (
                <Badge key={genre.id} variant="outline" className="text-sm">
                  {genre.name}
                </Badge>
              ))}

              <div className="flex items-center gap-1 ml-2">
                <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {tvShow.vote_average.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Badge variant="secondary">{status}</Badge>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Calendar className="w-4 h-4" />
                <span>{firstAirDate}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
              <div>
                <span className="font-medium text-white">Temporadas:</span>{" "}
                {tvShow.number_of_seasons}
              </div>
              <div>
                <span className="font-medium text-white">Episódios:</span>{" "}
                {tvShow.number_of_episodes}
              </div>
              {tvShow.networks && tvShow.networks.length > 0 && (
                <div>
                  <span className="font-medium text-white">Rede:</span>{" "}
                  {tvShow.networks.map((n: any) => n.name).join(", ")}
                </div>
              )}
            </div>

            <p className="text-lg text-gray-300">{tvShow.overview}</p>

            {videos.length > 0 && (
              <div className="pt-2">
                <VideoPlayer videos={videos} />
              </div>
            )}

            <div className="pt-4">
              <StreamingProviders
                providers={watchProviders}
                title={tvShow.name}
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
            <MovieRecommendations movieId={id} mediaType="tv" />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
