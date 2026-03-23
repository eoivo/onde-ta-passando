// Serviço para buscar conteúdo por plataforma de streaming
import { Movie, TV } from './tmdb-api';

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {}
) {
  const queryParams = new URLSearchParams({
    language: "pt-BR",
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        "Authorization": `Bearer ${TMDB_API_KEY}`,
        "Accept": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return { results: [] };
  }
}

interface DiscoverParams {
  with_watch_providers: string;
  watch_region: string;
  sort_by: string;
  page: string;
  include_adult: string;
}

/**
 * Busca conteúdo disponível em uma plataforma específica
 * @param providerId - ID do provider na TMDB (ex: 8 = Netflix, 119 = Prime Video)
 * @param mediaType - Tipo de mídia: 'movie' ou 'tv'
 * @param page - Número da página para paginação
 * @returns Array de filmes ou séries
 */
export async function getContentByProvider(
  providerId: number,
  mediaType: 'movie' | 'tv' = 'movie',
  page: number = 1
): Promise<Movie[] | TV[]> {
  const params: DiscoverParams = {
    with_watch_providers: providerId.toString(),
    watch_region: 'BR',
    sort_by: 'popularity.desc',
    page: page.toString(),
    include_adult: 'false',
  };

  const data = await fetchFromTMDB(`/discover/${mediaType}`, params as any);
  return data.results || [];
}

/**
 * Busca conteúdo combinado (filmes + séries) de uma plataforma
 * @param providerId - ID do provider na TMDB
 * @param moviesCount - Quantos filmes buscar
 * @param tvCount - Quantas séries buscar
 * @returns Objeto com filmes e séries
 */
export async function getMixedContentByProvider(
  providerId: number,
  moviesCount: number = 10,
  tvCount: number = 10
) {
  const [movies, tvShows] = await Promise.all([
    getContentByProvider(providerId, 'movie'),
    getContentByProvider(providerId, 'tv')
  ]);

  return {
    movies: movies.slice(0, moviesCount),
    tvShows: tvShows.slice(0, tvCount),
  };
}

/**
 * Busca conteúdo de múltiplas plataformas de uma vez
 * @param providerIds - Array de IDs de providers
 * @param mediaType - Tipo de mídia
 * @param limitPerProvider - Limite de resultados por provider
 * @returns Objeto mapeando providerId para array de conteúdo
 */
export async function getContentFromMultipleProviders(
  providerIds: number[],
  mediaType: 'movie' | 'tv' = 'movie',
  limitPerProvider: number = 20
): Promise<Record<number, Movie[] | TV[]>> {
  const results = await Promise.all(
    providerIds.map(async (providerId) => {
      const content = await getContentByProvider(providerId, mediaType);
      return { providerId, content: content.slice(0, limitPerProvider) };
    })
  );

  return results.reduce((acc, { providerId, content }) => {
    acc[providerId] = content;
    return acc;
  }, {} as Record<number, Movie[] | TV[]>);
}
