import Hero from "@/components/Hero"
import MovieCarousel from "@/components/MovieCarousel"
import { getTrending, getTopRated, getMoviesByGenre, getUpcoming } from "@/services/tmdb-api"

export default async function Home() {
  const trendingMovies = await getTrending("movie", "week")
  const topRatedMovies = await getTopRated("movie")
  const upcomingMovies = await getUpcoming()

  const actionMovies = await getMoviesByGenre(28)
  const comedyMovies = await getMoviesByGenre(35)
  const dramaMovies = await getMoviesByGenre(18)
  const romanceMovies = await getMoviesByGenre(10749)
  const sciFiMovies = await getMoviesByGenre(878)
  const horrorMovies = await getMoviesByGenre(27)
  const animationMovies = await getMoviesByGenre(16)
  const documentaryMovies = await getMoviesByGenre(99)

  const heroMovie = trendingMovies[0]

  return (
    <main className="min-h-screen pb-20">
      <Hero movie={heroMovie} />
      <div className="px-4 md:px-8 space-y-8 -mt-20 relative z-10">
        <MovieCarousel title="Em alta esta semana" movies={trendingMovies} />
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
  )
}
