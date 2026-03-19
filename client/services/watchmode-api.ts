const WATCHMODE_API_KEY = process.env.NEXT_PUBLIC_WATCHMODE_API_KEY || "";
const BASE_URL = "https://api.watchmode.com/v1";

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  web_url: string;
  format: string;
  price: number | null;
  seasons: number | null;
  episodes: number | null;
}

export const getWatchmodeSources = async (imdbId: string): Promise<WatchmodeSource[]> => {
  if (!imdbId) return [];
  
  try {
    // A Watchmode permite buscar diretamente pelo IMDB ID (prefixo tt)
    const response = await fetch(
      `${BASE_URL}/title/${imdbId}/sources/?apiKey=${WATCHMODE_API_KEY}&regions=BR`
    );
    
    if (!response.ok) {
      console.error("Erro na API Watchmode:", response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data as WatchmodeSource[];
  } catch (error) {
    console.error("Erro ao buscar fontes Watchmode:", error);
    return [];
  }
};
