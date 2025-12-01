// Serviço unificado para buscar coleções e universos
import { Movie } from './tmdb-api';

const API_KEY = process.env.API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

// Tipos
export type CollectionType = 'tmdb-collection' | 'company' | 'keyword';

export interface UniverseConfig {
  id: number;
  name: string;
  type: CollectionType;
  description?: string;
}

export interface CollectionMovie {
  id: string;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  backdrop_path?: string | null;
}

export interface UnifiedCollection {
  id: number;
  name: string;
  type: CollectionType;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  movies: CollectionMovie[];
}

// Configuração de universos em destaque (6 coleções na ordem especificada)
export const FEATURED_UNIVERSES: UniverseConfig[] = [
  // 1. Marvel Cinematic Universe (Keyword)
  { 
    id: 180547, 
    name: "Marvel Cinematic Universe", 
    type: "keyword",
    description: "O universo cinematográfico compartilhado da Marvel"
  },
  // 2. DC (Company)
  { 
    id: 9993, 
    name: "DC", 
    type: "company",
    description: "Heróis e vilões do universo DC" 
  },
  // 3. Star Wars (Collection)
  { 
    id: 10, 
    name: "Star Wars", 
    type: "tmdb-collection",
    description: "A saga completa em uma galáxia muito, muito distante"
  },
  // 4. Harry Potter (Collection)
  { 
    id: 1241, 
    name: "Harry Potter", 
    type: "tmdb-collection",
    description: "O mundo mágico de Harry Potter"
  },
  // 5. Senhor dos Anéis (Collection)
  { 
    id: 119, 
    name: "Senhor dos Anéis", 
    type: "tmdb-collection",
    description: "A jornada épica pela Terra Média"
  },
  // 6. Velozes & Furiosos (Collection)
  { 
    id: 9485, 
    name: "Velozes & Furiosos", 
    type: "tmdb-collection",
    description: "Velocidade, ação e família"
  },
];

// Mapeamento de nomes de companies (para quando não vem da API)
const COMPANY_NAMES: Record<number, string> = {
  9993: "DC Films",
  420: "Marvel Studios",
  3: "Pixar",
  10342: "Studio Ghibli",
  521: "DreamWorks",
};

// Descrições padrão para companies
const COMPANY_DESCRIPTIONS: Record<number, string> = {
  9993: "Heróis e vilões do universo DC",
  420: "Filmes da Marvel Studios",
  3: "Animação de qualidade da Pixar",
  10342: "Obras-primas do Studio Ghibli",
  521: "Filmes animados da DreamWorks",
};

// Função auxiliar para fazer requisições à TMDB
async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {}
) {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: "pt-BR",
    ...params,
  });

  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache 1 hora
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return null;
  }
}

// Buscar coleção TMDB específica
async function getTMDBCollection(id: number): Promise<UnifiedCollection | null> {
  const data = await fetchFromTMDB(`/collection/${id}`);
  
  if (!data || !data.parts) {
    return null;
  }

  return {
    id,
    name: data.name || "Coleção",
    type: 'tmdb-collection',
    overview: data.overview || "",
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    movies: data.parts
      .map((part: any) => ({
        id: part.id.toString(),
        title: part.title,
        release_date: part.release_date || "",
        poster_path: part.poster_path,
        overview: part.overview || "",
        vote_average: part.vote_average || 0,
        backdrop_path: part.backdrop_path,
        media_type: "movie",
      }))
      .sort((a: CollectionMovie, b: CollectionMovie) => {
        // Ordenar por data de lançamento
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      }),
  };
}

// Buscar filmes por Company
async function getCompanyMovies(companyId: number): Promise<UnifiedCollection | null> {
  const data = await fetchFromTMDB('/discover/movie', {
    with_companies: companyId.toString(),
    sort_by: 'popularity.desc',
    include_adult: 'false',
  });

  if (!data || !data.results || data.results.length === 0) {
    return null;
  }

  return {
    id: companyId,
    name: COMPANY_NAMES[companyId] || "Filmes",
    type: 'company',
    overview: COMPANY_DESCRIPTIONS[companyId] || "",
    movies: data.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      release_date: movie.release_date || "",
      poster_path: movie.poster_path,
      overview: movie.overview || "",
      vote_average: movie.vote_average || 0,
      backdrop_path: movie.backdrop_path,
      media_type: "movie",
    })),
  };
}

// Buscar filmes por Keyword
async function getKeywordMovies(keywordId: number): Promise<UnifiedCollection | null> {
  const data = await fetchFromTMDB('/discover/movie', {
    with_keywords: keywordId.toString(),
    sort_by: 'popularity.desc',
    include_adult: 'false',
  });

  if (!data || !data.results || data.results.length === 0) {
    return null;
  }

  // Buscar nome da keyword para usar como título
  const keywordData = await fetchFromTMDB(`/keyword/${keywordId}`);
  const keywordName = keywordData?.name || "Filmes";

  return {
    id: keywordId,
    name: keywordName,
    type: 'keyword',
    overview: "",
    movies: data.results.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      release_date: movie.release_date || "",
      poster_path: movie.poster_path,
      overview: movie.overview || "",
      vote_average: movie.vote_average || 0,
      backdrop_path: movie.backdrop_path,
      media_type: "movie",
    })),
  };
}

// Função principal para buscar conteúdo de um universo
export async function getUniverseContent(
  config: UniverseConfig
): Promise<UnifiedCollection | null> {
  try {
    switch (config.type) {
      case 'tmdb-collection':
        return await getTMDBCollection(config.id);
      case 'company':
        return await getCompanyMovies(config.id);
      case 'keyword':
        return await getKeywordMovies(config.id);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching universe ${config.name}:`, error);
    return null;
  }
}

// Buscar múltiplos universos em paralelo
export async function getMultipleUniverses(
  configs: UniverseConfig[]
): Promise<Record<number, UnifiedCollection>> {
  const promises = configs.map((config) =>
    getUniverseContent(config).then((collection) => ({
      config,
      collection,
    }))
  );

  const results = await Promise.all(promises);

  const universes: Record<number, UnifiedCollection> = {};
  
  results.forEach(({ config, collection }) => {
    if (collection) {
      // Usar o nome do config se disponível, caso contrário usar o da collection
      collection.name = config.name || collection.name;
      universes[config.id] = collection;
    }
  });

  return universes;
}

// Buscar uma coleção por ID (detecta o tipo automaticamente)
export async function getCollectionById(
  id: number
): Promise<UnifiedCollection | null> {
  // Tentar encontrar o config no FEATURED_UNIVERSES
  const config = FEATURED_UNIVERSES.find((c) => c.id === id);
  
  if (config) {
    return await getUniverseContent(config);
  }

  // Se não encontrar, tentar inferir o tipo baseado em IDs conhecidos
  // TMDB Collections geralmente têm IDs menores
  // Companies e Keywords têm IDs maiores
  
  // Tentar como TMDB Collection primeiro (IDs conhecidos)
  const knownCollectionIds = [10, 1241, 119, 9485, 131635, 645, 328];
  if (knownCollectionIds.includes(id)) {
    return await getTMDBCollection(id);
  }

  // Tentar como Company
  if (Object.keys(COMPANY_NAMES).includes(id.toString())) {
    return await getCompanyMovies(id);
  }

  // Tentar como Keyword (MCU tem ID 180547)
  if (id === 180547) {
    return await getKeywordMovies(id);
  }

  // Se não conseguir identificar, retornar null
  return null;
}

