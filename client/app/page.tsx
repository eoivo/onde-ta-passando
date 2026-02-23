import HeroCarousel from "@/components/HeroCarousel";
import MovieCarousel from "@/components/MovieCarousel";
import CollectionsGrid from "@/components/CollectionsGrid";
import {
  getTrending,
  getTopRated,
  getMoviesByGenre,
  getUpcoming,
} from "@/services/tmdb-api";
import { getContentFromMultipleProviders } from "@/services/streaming-sections";
import { FEATURED_PROVIDERS } from "@/services/streaming-api";
import {
  FEATURED_UNIVERSES,
  getMultipleUniverses
} from "@/services/collections-api";

export default async function Home() {
  const trendingMovies = await getTrending("movie", "week");
  const trendingTVShows = await getTrending("tv", "week");
  const topRatedMovies = await getTopRated("movie");
  const topRatedTVShows = await getTopRated("tv");
  const upcomingMovies = await getUpcoming();

  // Gêneros básicos
  const actionMovies = await getMoviesByGenre(28);
  const comedyMovies = await getMoviesByGenre(35);
  const dramaMovies = await getMoviesByGenre(18);
  const romanceMovies = await getMoviesByGenre(10749);
  const sciFiMovies = await getMoviesByGenre(878);
  const horrorMovies = await getMoviesByGenre(27);
  const animationMovies = await getMoviesByGenre(16);
  const documentaryMovies = await getMoviesByGenre(99);

  // Gêneros adicionais com títulos chamativos
  const thrillerMovies = await getMoviesByGenre(53); // Thriller
  const fantasyMovies = await getMoviesByGenre(14); // Fantasia
  const crimeMovies = await getMoviesByGenre(80); // Crime
  const warMovies = await getMoviesByGenre(10752); // Guerra
  const familyMovies = await getMoviesByGenre(10751); // Família
  const mysteryMovies = await getMoviesByGenre(9648); // Mistério
  const adventureMovies = await getMoviesByGenre(12); // Aventura

  // Buscar coleções e universos (6 coleções na ordem especificada)
  const universes = await getMultipleUniverses(FEATURED_UNIVERSES);

  // Buscar conteúdo das plataformas de streaming (filmes + séries)
  const providerIds = FEATURED_PROVIDERS.map(p => p.id);
  const streamingMovies = await getContentFromMultipleProviders(providerIds, 'movie', 10);
  const streamingTVShows = await getContentFromMultipleProviders(providerIds, 'tv', 10);

  // Combinar filmes e séries de cada provider
  const streamingContent: Record<number, any[]> = {};
  providerIds.forEach(id => {
    const movies = streamingMovies[id] || [];
    const tvShows = streamingTVShows[id] || [];
    streamingContent[id] = [...movies, ...tvShows];
  });

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
      <div className="px-4 md:px-12 space-y-12 -mt-20 relative z-10">
        <MovieCarousel title="Filmes em alta" movies={trendingMovies} />
        <MovieCarousel title="Séries em alta" movies={trendingTVShows} />
        <MovieCarousel title="Mais bem avaliados" movies={topRatedMovies} />
        <MovieCarousel title="Lançamentos" movies={upcomingMovies} />

        {/* Seção de Coleções e Universos com Grid */}
        <div id="colecoes" className="scroll-mt-24">
          <CollectionsGrid
            collections={Object.values(universes).filter(
              (u) => u && u.movies.length > 0
            )}
            configs={FEATURED_UNIVERSES}
          />
        </div>

        {/* Seções com títulos chamativos - Ordem aleatória misturada */}
        <MovieCarousel title="Ação" movies={actionMovies} />
        <MovieCarousel title="Tensão Máxima" movies={thrillerMovies} />
        <MovieCarousel title="Comédia" movies={comedyMovies} />
        <MovieCarousel title="Mundos Mágicos" movies={fantasyMovies} />
        <MovieCarousel title="Drama" movies={dramaMovies} />
        <MovieCarousel title="Crimes e Mistérios" movies={crimeMovies} />
        <MovieCarousel title="Romance" movies={romanceMovies} />
        <MovieCarousel title="Aventuras Épicas" movies={adventureMovies} />
        <MovieCarousel title="Ficção Científica" movies={sciFiMovies} />
        <MovieCarousel title="Batalhas Épicas" movies={warMovies} />
        <MovieCarousel title="Terror" movies={horrorMovies} />
        <MovieCarousel title="Diversão em Família" movies={familyMovies} />
        <MovieCarousel title="Animação" movies={animationMovies} />
        <MovieCarousel title="Enigmas e Segredos" movies={mysteryMovies} />
        <MovieCarousel title="Documentários" movies={documentaryMovies} />

        {/* Seções de Streaming */}
        {FEATURED_PROVIDERS.map((provider) => {
          const content = streamingContent[provider.id] || [];
          if (content.length === 0) return null;

          return (
            <MovieCarousel
              key={provider.id}
              title={provider.name}
              movies={content}
            />
          );
        })}
      </div>
    </main>
  );
}
