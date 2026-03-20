// [FIX C-01] Todas as chamadas ao TMDB passam pelo proxy interno do Next.js.
// A chave da API fica APENAS no servidor (TMDB_API_KEY sem prefixo NEXT_PUBLIC_).
import { sortAndFilterResults } from "@/utils/media-utils";

export interface Movie {
  id: string;
  title: string;
  poster_path: string | null;
  release_date?: string;
  overview?: string;
  vote_average?: number;
  backdrop_path?: string | null;
  genre_ids?: number[];
}

export interface TV {
  id: string;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
  overview?: string;
  vote_average?: number;
  backdrop_path?: string | null;
  genre_ids?: number[];
}

async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {}
) {
  // Detectar se estamos no servidor (SSR) ou no cliente
  const isServer = typeof window === "undefined";

  let url: string;

  if (isServer) {
    // No servidor: chamar TMDB diretamente com o Bearer Token v4 (protegido)
    const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
    const queryParams = new URLSearchParams({
      language: "pt-BR",
      ...params,
    });
    url = `https://api.themoviedb.org/3${endpoint}?${queryParams}`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 60 * 60 },
        headers: {
          "Authorization": `Bearer ${TMDB_API_KEY}`,
          "Accept": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`TMDB Proxy error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      return { results: [] };
    }
  } else {
    // No cliente (browser): usar o proxy seguro do Next.js
    const queryParams = new URLSearchParams({
      language: "pt-BR",
      ...params,
    });
    url = `/api/tmdb${endpoint}?${queryParams}`;

    try {
      const response = await fetch(url, { next: { revalidate: 60 * 60 } });
      if (!response.ok) {
        throw new Error(`TMDB Proxy error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      return { results: [] };
    }
  }
}

export async function getTrending(
  mediaType: "movie" | "tv" | "all",
  timeWindow: "day" | "week" = "week"
) {
  const data = await fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  return sortAndFilterResults(data.results || []);
}

export async function getTopRated(mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/${mediaType}/top_rated`);
  return sortAndFilterResults(data.results || []);
}

export async function getUpcoming() {
  const data = await fetchFromTMDB("/movie/upcoming", {
    region: "BR",
  });
  return sortAndFilterResults(data.results || []);
}

export async function getMoviesByGenre(genreId: number) {
  const data = await fetchFromTMDB("/discover/movie", {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
    "vote_count.gte": "10"
  });
  return sortAndFilterResults(data.results || []);
}

interface DiscoverMoviesParams {
  genreId?: string;
  sortBy?: string;
  year?: string;
  page?: number;
  providerId?: string;
  keywords?: string;
}

export async function discoverMovies({
  genreId,
  sortBy,
  year,
  page = 1,
  providerId,
  keywords,
}: DiscoverMoviesParams) {
  const params: Record<string, string> = {
    sort_by: sortBy || "popularity.desc",
    page: page.toString(),
    include_adult: "false",
  };

  if (genreId) {
    params.with_genres = genreId;
  }

  if (year) {
    params.primary_release_year = year;
  }

  if (providerId) {
    params.with_watch_providers = providerId;
    params.watch_region = "BR";
  }

  if (keywords) {
    params.with_keywords = keywords;
  }

  // Melhora a qualidade dos resultados:
  // 1. Exige pelo menos um número mínimo de votos para evitar "cascas vazias"
  // 2. Garante que o conteúdo seja minimamente relevante
  if (!sortBy || sortBy.includes("popularity") || sortBy.includes("vote_average")) {
    params["vote_count.gte"] = "10";
  }

  const data = await fetchFromTMDB("/discover/movie", params);

  // Aplica filtro de qualidade para remover itens sem imagem ou sinopse
  if (data.results) {
    data.results = sortAndFilterResults(data.results);
  }

  return data;
}

interface DiscoverTVShowsParams {
  genreId?: string;
  sortBy?: string;
  year?: string;
  page?: number;
  providerId?: string;
  keywords?: string;
}

export async function discoverTVShows({
  genreId,
  sortBy,
  year,
  page = 1,
  providerId,
  keywords,
}: DiscoverTVShowsParams) {
  const params: Record<string, string> = {
    sort_by: sortBy || "popularity.desc",
    page: page.toString(),
    include_adult: "false",
  };

  if (genreId) {
    params.with_genres = genreId;
  }

  if (year) {
    params.first_air_date_year = year;
  }

  if (providerId) {
    params.with_watch_providers = providerId;
    params.watch_region = "BR";
  }

  if (keywords) {
    params.with_keywords = keywords;
  }

  // Melhora a qualidade dos resultados em séries:
  // Séries costumam ter menos votos que filmes, então usamos um limite menor (5)
  if (!sortBy || sortBy.includes("popularity") || sortBy.includes("vote_average")) {
    params["vote_count.gte"] = "5";
  }

  const data = await fetchFromTMDB("/discover/tv", params);

  // Aplica filtro de qualidade para remover itens sem imagem ou sinopse
  if (data.results) {
    data.results = sortAndFilterResults(data.results);
  }

  return data;
}

export async function getMovieDetails(movieId: string) {
  return await fetchFromTMDB(`/movie/${movieId}`, { append_to_response: "external_ids" });
}

export async function getTvDetails(tvId: string) {
  return await fetchFromTMDB(`/tv/${tvId}`, { append_to_response: "external_ids" });
}

export async function getMovieCredits(movieId: string) {
  return await fetchFromTMDB(`/movie/${movieId}/credits`);
}

export async function getTvCredits(tvId: string) {
  return await fetchFromTMDB(`/tv/${tvId}/credits`);
}

export async function getMovieVideos(movieId: string) {
  let data = await fetchFromTMDB(`/movie/${movieId}/videos`, {
    language: "pt-BR",
  });

  if (!data.results || data.results.length === 0) {
    data = await fetchFromTMDB(`/movie/${movieId}/videos`, {
      language: "en-US",
    });
  }

  return data.results || [];
}

export async function getTvVideos(tvId: string) {
  let data = await fetchFromTMDB(`/tv/${tvId}/videos`, { language: "pt-BR" });

  if (!data.results || data.results.length === 0) {
    data = await fetchFromTMDB(`/tv/${tvId}/videos`, { language: "en-US" });
  }

  return data.results || [];
}

export async function getWatchProviders(id: string, mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/${mediaType}/${id}/watch/providers`);
  return data;
}

export async function searchMovies(query: string, page: number = 1, year?: string, genre?: string) {
  const params: Record<string, string> = { query, page: page.toString(), include_adult: "false" };
  if (year) params.primary_release_year = year;
  if (genre) params.with_genres = genre;
  return await fetchFromTMDB("/search/movie", params);
}

export async function searchTVShows(query: string, page: number = 1, year?: string, genre?: string) {
  const params: Record<string, string> = { query, page: page.toString(), include_adult: "false" };
  if (year) params.first_air_date_year = year;
  if (genre) params.with_genres = genre;
  return await fetchFromTMDB("/search/tv", params);
}

export async function searchMulti(
  query: string,
  type?: string,
  genre?: string,
  year?: string,
  page: number = 1
) {
  let endpoint = "/search/multi";
  const params: Record<string, string> = {
    query,
    page: page.toString(),
    include_adult: "false"
  };

  if (type && type !== "all") {
    if (type === "movies") {
      endpoint = "/search/movie";
    } else if (type === "tv") {
      endpoint = "/search/tv";
    } else if (type === "people") {
      endpoint = "/search/person";
    }
  }

  if (genre) {
    params.with_genres = genre;
  }

  if (year) {
    if (type === "tv") {
      params.first_air_date_year = year;
    } else {
      params.primary_release_year = year;
    }
  }

  return await fetchFromTMDB(endpoint, params);
}

export async function getMovieRecommendations(movieId: string, page: number = 1) {
  const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`, { page: page.toString() });
  return data;
}

export async function getTvRecommendations(tvId: string, page: number = 1) {
  const data = await fetchFromTMDB(`/tv/${tvId}/recommendations`, { page: page.toString() });
  return data;
}

export async function getGenres(mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/genre/${mediaType}/list`);
  return data.genres || [];
}

export async function getMediaKeywords(id: string, mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/${mediaType}/${id}/keywords`);
  // Movies return { keywords: [] }, TV shows return { results: [] }
  return data.keywords || data.results || [];
}
