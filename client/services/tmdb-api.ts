const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

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
  const queryParams = new URLSearchParams({
    language: "pt-BR",
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 * 60 },
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

export async function getTrending(
  mediaType: "movie" | "tv" | "all",
  timeWindow: "day" | "week" = "week"
) {
  const data = await fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  return data.results || [];
}

export async function getTopRated(mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/${mediaType}/top_rated`);
  return data.results || [];
}

export async function getUpcoming() {
  const data = await fetchFromTMDB("/movie/upcoming", {
    region: "BR",
  });
  return data.results || [];
}

export async function getMoviesByGenre(genreId: number) {
  const data = await fetchFromTMDB("/discover/movie", {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
  return data.results || [];
}

interface DiscoverMoviesParams {
  genreId?: string;
  sortBy?: string;
  year?: string;
  page?: number;
}

export async function discoverMovies({
  genreId,
  sortBy,
  year,
  page = 1,
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

  return await fetchFromTMDB("/discover/movie", params);
}

interface DiscoverTVShowsParams {
  genreId?: string;
  sortBy?: string;
  year?: string;
  page?: number;
}

export async function discoverTVShows({
  genreId,
  sortBy,
  year,
  page = 1,
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

  return await fetchFromTMDB("/discover/tv", params);
}

export async function getMovieDetails(movieId: string) {
  return await fetchFromTMDB(`/movie/${movieId}`);
}

export async function getTvDetails(tvId: string) {
  return await fetchFromTMDB(`/tv/${tvId}`);
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

export async function searchMulti(
  query: string,
  type?: string,
  genre?: string,
  year?: string
) {
  let endpoint = "/search/multi";
  const params: Record<string, string> = { query };

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

  const data = await fetchFromTMDB(endpoint, params);
  return data.results || [];
}

export async function getMovieRecommendations(movieId: string) {
  const data = await fetchFromTMDB(`/movie/${movieId}/recommendations`);
  return data.results || [];
}

export async function getTvRecommendations(tvId: string) {
  const data = await fetchFromTMDB(`/tv/${tvId}/recommendations`);
  return data.results || [];
}

export async function getGenres(mediaType: "movie" | "tv") {
  const data = await fetchFromTMDB(`/genre/${mediaType}/list`);
  return data.genres || [];
}
