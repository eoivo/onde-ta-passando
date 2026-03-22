import HeroCarousel from "@/components/HeroCarousel";
import MovieCarousel from "@/components/MovieCarousel";
import CollectionsSection from "@/components/CollectionsSection";
import {
  getTrending,
  getTopRated,
  getMoviesByGenre,
  getUpcoming,
} from "@/services/tmdb-api";
import { getContentFromMultipleProviders } from "@/services/streaming-sections";
import { FEATURED_PROVIDERS } from "@/services/streaming-api";
import {
  FEATURED_SAGAS,
  FEATURED_UNIVERSES,
  FEATURED_STUDIOS,
  getMultipleCollections,
} from "@/services/collections-api";

export default async function Home() {
  // 1. Buscas base (Tendências, Status e Coleções) - Agora em dobro!
  const [
    trendingMoviesP1, trendingMoviesP2,
    trendingTVShowsP1, trendingTVShowsP2,
    topRatedMoviesP1, topRatedMoviesP2,
    topRatedTVShowsP1, topRatedTVShowsP2,
    upcomingMoviesP1, upcomingMoviesP2,
    sagasData,
    universesData,
    studiosData,
  ] = await Promise.all([
    getTrending("movie", "week", 1), getTrending("movie", "week", 2),
    getTrending("tv", "week", 1), getTrending("tv", "week", 2),
    getTopRated("movie", 1), getTopRated("movie", 2),
    getTopRated("tv", 1), getTopRated("tv", 2),
    getUpcoming(1), getUpcoming(2),
    getMultipleCollections(FEATURED_SAGAS),
    getMultipleCollections(FEATURED_UNIVERSES),
    getMultipleCollections(FEATURED_STUDIOS),
  ]);

  const trendingMovies = [...trendingMoviesP1, ...trendingMoviesP2];
  const trendingTVShows = [...trendingTVShowsP1, ...trendingTVShowsP2];
  const topRatedMovies = [...topRatedMoviesP1, ...topRatedMoviesP2];
  const upcomingMovies = [...upcomingMoviesP1, ...upcomingMoviesP2];

  const sagas = Object.values(sagasData).filter((u) => u?.movies.length > 0);
  const universes = Object.values(universesData).filter((u) => u?.movies.length > 0);
  const studios = Object.values(studiosData).filter((u) => u?.movies.length > 0);

  // 2. Buscas para seções temáticas (Moods) - 3 páginas para garantir 40 únicos no final
  const [
    action1, action2, action3, adventure1, adventure2, adventure3,
    thriller1, thriller2, crime1, crime2, mystery1, mystery2,
    sciFi1, sciFi2, fantasy1, fantasy2, animation1, animation2,
    drama1, drama2, romance1, romance2,
    horror1, horror2, horror3,
    comedy1, comedy2, family1, family2,
    docs1, docs2
  ] = await Promise.all([
    getMoviesByGenre(28, 1), getMoviesByGenre(28, 2), getMoviesByGenre(28, 3), getMoviesByGenre(12, 1), getMoviesByGenre(12, 2), getMoviesByGenre(12, 3),
    getMoviesByGenre(53, 1), getMoviesByGenre(53, 2), getMoviesByGenre(80, 1), getMoviesByGenre(80, 2), getMoviesByGenre(9648, 1), getMoviesByGenre(9648, 2),
    getMoviesByGenre(878, 1), getMoviesByGenre(878, 2), getMoviesByGenre(14, 1), getMoviesByGenre(14, 2), getMoviesByGenre(16, 1), getMoviesByGenre(16, 2),
    getMoviesByGenre(18, 1), getMoviesByGenre(18, 2), getMoviesByGenre(10749, 1), getMoviesByGenre(10749, 2),
    getMoviesByGenre(27, 1), getMoviesByGenre(27, 2), getMoviesByGenre(27, 3),
    getMoviesByGenre(35, 1), getMoviesByGenre(35, 2), getMoviesByGenre(10751, 1), getMoviesByGenre(10751, 2),
    getMoviesByGenre(99, 1), getMoviesByGenre(99, 2)
  ]);

  // 3. Montar o Hero (Top 15 misturado)
  const heroItems = [
    ...trendingMoviesP1.slice(0, 4),
    ...trendingTVShowsP1.slice(0, 3),
    ...topRatedMoviesP1.slice(0, 3),
    ...upcomingMoviesP1.slice(0, 5),
  ].map((item) => ({
    ...item,
    media_type: item.media_type || (item.first_air_date ? "tv" : "movie"),
  }));

  // 4. Lógica de Desduplicação Global
  const shownGlobal = new Set<string>();

  // Auxiliar para garantir unicidade em UMA ÚNICA fileira (Evita erro de Key do React)
  const ensureUnique = (movies: any[]) => {
    const seen = new Set<string>();
    return movies.filter(m => {
      const idStr = m.id.toString();
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  };

  // Auxiliar para as vitrines (Evita repetição entre elas)
  const getUniqueMood = (movies: any[], limit = 40) => {
    const localUnique = ensureUnique(movies);
    const result: any[] = [];
    
    for (const m of localUnique) {
      if (result.length >= limit) break;
      const idStr = m.id.toString();
      if (!shownGlobal.has(idStr)) {
        result.push(m);
        shownGlobal.add(idStr);
      }
    }
    return result;
  };

  const moodSections = [
    { title: "Adrenalina e Conquista", movies: getUniqueMood([...action1, ...action2, ...action3, ...adventure1, ...adventure2, ...adventure3]) },
    { title: "Sombras e Investigação", movies: getUniqueMood([...thriller1, ...thriller2, ...crime1, ...crime2, ...mystery1, ...mystery2]) },
    { title: "Mundos de Fantasias", movies: getUniqueMood([...sciFi1, ...sciFi2, ...fantasy1, ...fantasy2, ...animation1, ...animation2]) },
    { title: "Dramas que Emocionam", movies: getUniqueMood([...drama1, ...drama2, ...romance1, ...romance2]) },
    { title: "Sessão Calafrio", movies: getUniqueMood([...horror1, ...horror2, ...horror3]) },
    { title: "Para Rir e Relaxar", movies: getUniqueMood([...comedy1, ...comedy2, ...family1, ...family2]) }, 
    { title: "A Realidade como Ela É", movies: getUniqueMood([...docs1, ...docs2]) },
  ];

  // 5. Conteúdo de Streaming (40 obras)
  const providerIds = FEATURED_PROVIDERS.map(p => p.id);
  const [streamingMovies, streamingTVShows] = await Promise.all([
    getContentFromMultipleProviders(providerIds, 'movie', 20),
    getContentFromMultipleProviders(providerIds, 'tv', 20)
  ]);

  const streamingContent: Record<number, any[]> = {};
  providerIds.forEach(id => {
    const combined = [...(streamingMovies[id] || []), ...(streamingTVShows[id] || [])];
    streamingContent[id] = ensureUnique(combined);
  });

  return (
    <main className="min-h-screen pb-20">
      <HeroCarousel movies={heroItems} />
      
      <div className="px-4 md:px-12 space-y-3 md:space-y-10 -mt-10 md:-mt-8 relative z-10">
        <MovieCarousel title="Filmes em alta" movies={ensureUnique(trendingMovies).slice(0, 40)} />
        <MovieCarousel title="Séries em alta" movies={ensureUnique(trendingTVShows).slice(0, 40)} />
        <MovieCarousel title="Mais bem avaliados" movies={ensureUnique(topRatedMovies).slice(0, 40)} />
        <MovieCarousel title="Próximas Estreias" movies={ensureUnique(upcomingMovies).slice(0, 40)} />

        {/* Seção de Sagas, Universos e Estúdios */}
        <div id="colecoes" className="scroll-mt-24">
          <CollectionsSection
            sagas={sagas}
            universes={universes}
            studios={studios}
          />
        </div>

        {/* Vitrines Temáticas (Moods) */}
        {moodSections.map((section, idx) => (
          section.movies.length > 0 && (
            <MovieCarousel key={idx} title={section.title} movies={section.movies} />
          )
        ))}

        {/* Seções de Streaming */}
        {FEATURED_PROVIDERS.map((provider) => {
          const content = streamingContent[provider.id] || [];
          if (content.length === 0) return null;
          return <MovieCarousel key={provider.id} title={provider.name} movies={content.slice(0, 40)} />;
        })}
      </div>
    </main>
  );
}
