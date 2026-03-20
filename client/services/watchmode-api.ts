// [FIX C-01] Todas as chamadas ao Watchmode passam pelo proxy interno do Next.js.
// A chave da API fica APENAS no servidor (WATCHMODE_API_KEY sem prefixo NEXT_PUBLIC_).

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
    // Usa o proxy seguro do Next.js — a chave nunca vai pro browser
    const response = await fetch(
      `/api/watchmode/title/${imdbId}/sources?regions=BR`
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
