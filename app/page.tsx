import HeroCarousel from "@/components/HeroCarousel";
import MovieCarousel from "@/components/MovieCarousel";
import {
  getTrending,
  getTopRated,
  getMoviesByGenre,
  getUpcoming,
} from "@/services/tmdb-api";

export default async function Home() {
  const trendingMovies = await getTrending("movie", "week");
  const trendingTVShows = await getTrending("tv", "week");
  const topRatedMovies = await getTopRated("movie");
  const topRatedTVShows = await getTopRated("tv");
  const upcomingMovies = await getUpcoming();

  const actionMovies = await getMoviesByGenre(28);
  const comedyMovies = await getMoviesByGenre(35);
  const dramaMovies = await getMoviesByGenre(18);
  const romanceMovies = await getMoviesByGenre(10749);
  const sciFiMovies = await getMoviesByGenre(878);
  const horrorMovies = await getMoviesByGenre(27);
  const animationMovies = await getMoviesByGenre(16);
  const documentaryMovies = await getMoviesByGenre(99);

  const combinedTrending = [
    ...trendingMovies.slice(0, 4),
    ...trendingTVShows.slice(0, 3),
    ...topRatedMovies.slice(0, 3),
    ...topRatedTVShows.slice(0, 2),
    ...upcomingMovies.slice(0, 2),
    ...sciFiMovies.slice(0, 1),
    ...horrorMovies.slice(0, 1),
    ...animationMovies.slice(0, 1),
    ...actionMovies.slice(0, 1),
  ];

  const heroItems = combinedTrending.map((item) => ({
    ...item,
    media_type: item.media_type || (item.first_air_date ? "tv" : "movie"),
  }));

  const shuffledHeroItems = [...heroItems].sort(() => Math.random() - 0.5);

  return (
    <main className="min-h-screen pb-20">
      <HeroCarousel movies={shuffledHeroItems} />
      <div className="px-4 md:px-8 space-y-8 -mt-20 relative z-10">
        <MovieCarousel title="Filmes em alta" movies={trendingMovies} />
        <MovieCarousel title="Séries em alta" movies={trendingTVShows} />
        <MovieCarousel title="Mais bem avaliados" movies={topRatedMovies} />
        <MovieCarousel title="Lançamentos" movies={upcomingMovies} />
        <MovieCarousel title="Ação" movies={actionMovies} />
        <MovieCarousel title="Comédia" movies={comedyMovies} />
        <MovieCarousel title="Drama" movies={dramaMovies} />
        <MovieCarousel title="Romance" movies={romanceMovies} />
        <MovieCarousel title="Ficção Científica" movies={sciFiMovies} />
        <MovieCarousel title="Terror" movies={horrorMovies} />
        <MovieCarousel title="Animação" movies={animationMovies} />
        <MovieCarousel title="Documentários" movies={documentaryMovies} />
      </div>
    </main>
  );
}
