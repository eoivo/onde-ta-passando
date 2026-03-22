// Serviço unificado para Sagas, Universos e Estúdios
// Três conceitos distintos, três formas de agrupar conteúdo

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type CollectionType = "tmdb-collection" | "company" | "keyword" | "custom-saga";
export type CollectionCategory = "saga" | "universo" | "estudio";

export interface CustomSagaPart {
  name: string;
  description?: string;
  ids: number[]; // IDs de coleções ou filmes baseado no 'type'
  type: "tmdb-collection" | "movie";
}

export interface UniverseConfig {
  id: number | string;
  name: string;
  type: CollectionType;
  category: CollectionCategory;
  description?: string;
  /** IDs de coleções (números/strings) ou objetos com nomes customizados */
  franchises?: (number | string | { id: number | string; name: string })[];
  /** Partes que compõem esta mega-coleção (custom-saga) */
  parts?: CustomSagaPart[];
  /** IDs de filmes individuais para injetar */
  extraMovieIds?: number[];
  /** Caminhos de imagem customizados para branding (ex: posters/backdrops específicos) */
  customPosterPath?: string;
  customBackdropPath?: string;
}

export interface CollectionMovie {
  id: string;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  backdrop_path?: string | null;
  media_type?: string;
}

export interface UnifiedCollection {
  id: number | string;
  name: string;
  type: CollectionType;
  category: CollectionCategory;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  movies: CollectionMovie[];
  total_pages?: number;
  total_results?: number;
  /** Agrupamentos de Eras para Mega-Sagas */
  groups?: {
    name: string;
    description?: string;
    movies: CollectionMovie[];
  }[];
}

// ---------------------------------------------------------------------------
// Configs — Sagas (sequências ordenadas e finitas)
// ---------------------------------------------------------------------------

export const FEATURED_SAGAS: UniverseConfig[] = [
  {
    id: 1241,
    name: "Harry Potter",
    type: "tmdb-collection",
    category: "saga",
    description: "A saga completa do bruxo mais famoso do cinema",
  },
  {
    id: 10,
    name: "Star Wars",
    type: "tmdb-collection",
    category: "saga",
    description: "A saga épica em uma galáxia muito, muito distante",
  },
  {
    id: 119,
    name: "Senhor dos Anéis",
    type: "tmdb-collection",
    category: "saga",
    description: "A jornada épica pela Terra Média de Tolkien",
  },
  {
    id: 9485,
    name: "Velozes & Furiosos",
    type: "tmdb-collection",
    category: "saga",
    description: "Velocidade, adrenalina e família acima de tudo",
  },
  {
    id: 87359,
    name: "Missão Impossível",
    type: "tmdb-collection",
    category: "saga",
    description: "As missões mais impossíveis de Ethan Hunt",
  },
  {
    id: 645,
    name: "James Bond 007",
    type: "tmdb-collection",
    category: "saga",
    description: "O espião mais icônico da história do cinema",
  },
  {
    id: 328,
    name: "Jurassic Park",
    type: "tmdb-collection",
    category: "saga",
    description: "Onde dinossauros voltam a caminhar sobre a Terra",
  },
  {
    id: 10194,
    name: "Toy Story",
    type: "tmdb-collection",
    category: "saga",
    description: "A jornada inesquecível de Woody, Buzz e seus amigos",
  },
  {
    id: 84,
    name: "Indiana Jones",
    type: "tmdb-collection",
    category: "saga",
    description: "As aventuras do arqueólogo mais audacioso do cinema",
  },
  {
    id: 2150,
    name: "Shrek",
    type: "tmdb-collection",
    category: "saga",
    description: "Um pântano, um ogro e uma aventura muito além do Reino",
  },
  {
    id: 403374,
    name: "John Wick",
    type: "tmdb-collection",
    category: "saga",
    description: "A vingança imparável do lendário bicho-papão",
  },
  {
    id: 234,
    name: "Matrix",
    type: "tmdb-collection",
    category: "saga",
    description: "Escolha a pílula e descubra a verdade sobre a realidade",
  },
  {
    id: 8091,
    name: "Alien",
    type: "tmdb-collection",
    category: "saga",
    description: "No espaço, ninguém pode ouvir você gritar",
  },
];

// ---------------------------------------------------------------------------
// Configs — Universos (mundos compartilhados com múltiplas franquias)
// ---------------------------------------------------------------------------

export const FEATURED_UNIVERSES: UniverseConfig[] = [
  {
    id: 180547,
    name: "Marvel Cinematic Universe",
    type: "keyword",
    category: "universo",
    description: "O maior universo cinematográfico compartilhado da história",
    customBackdropPath: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg", // Avengers: Endgame
    customPosterPath: "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",   // Avengers: Endgame
    franchises: [
      86311,   // The Avengers Collection
      131292,  // Iron Man Collection
      131296,  // Thor Collection
      131295,  // Captain America Collection
      284433,  // Guardians of the Galaxy Collection
      531241,  // Spider-Man (MCU) Collection
      422834,  // Ant-Man Collection
      618529,  // Doctor Strange Collection
      529892,  // Black Panther Collection
      623911,  // Captain Marvel / The Marvels Collection
    ],
  },
  {
    id: "229266|367807" as any, // DCEU | Elseworlds (pega tudo de importante)
    name: "DC Universe",
    type: "keyword", 
    category: "universo",
    description: "Explore o multiverso da DC: do Snyderverse aos clássicos de Nolan e as novas visões de Elseworlds (The Batman, Coringa).",
    customBackdropPath: "/13Nz8EchKRdCgJcKdEoJAnpiVn2.jpg", // Zack Snyder's Justice League
    customPosterPath: "/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg",   // Zack Snyder's Justice League
    franchises: [
      "batman-completo",
      "superman-completo",
      { id: 987044, name: "Coringa (Joker): Saga de Todd Phillips" },
      { id: 531242, name: "Esquadrão Suicida: Coleção" },
      { id: 468552, name: "Mulher-Maravilha: Coleção" },
      { id: 573693, name: "Aquaman: Coleção" },
      { id: 724848, name: "Shazam! Coleção" },
    ],
    extraMovieIds: [
      13183,   // Watchmen (2009)
      752,     // V de Vingança (2005)
      44912,   // Lanterna Verde (2011)
      314,     // Mulher-Gato (2004)
    ],
  },
];

export const CUSTOM_SAGAS: UniverseConfig[] = [
  {
    id: "batman-completo",
    name: "Batman: O Guia Definitivo",
    type: "custom-saga",
    category: "saga",
    description: "Toda a trajetória do herói mais icônico de Gotham. Das cores clássicas de Burton à brutalidade de Nolan e Matt Reeves.",
    parts: [
      {
        name: "A Era de Ouro (Burton & Schumacher)",
        description: "Os clássicos góticos que definiram o Batman nos anos 90.",
        type: "tmdb-collection",
        ids: [120794],
      },
      {
        name: "A Trilogia Nolan (The Dark Knight)",
        description: "A visão definitiva e realista de Christopher Nolan.",
        type: "tmdb-collection",
        ids: [263],
      },
      {
        name: "O Universo de Matt Reeves (The Batman)",
        description: "O submundo de Gotham em um tom noir de crime e vingança.",
        type: "tmdb-collection",
        ids: [948485],
      },
      {
        name: "Presença no Universo DC (Snyderverse)",
        description: "O Batman de Affleck no meio da Liga da Justiça.",
        type: "movie",
        ids: [209112, 141052, 791373], // BvS, JL, Snyder Cut
      },
    ],
  },
  {
    id: "superman-completo",
    name: "Superman: Toda a Mitologia (1978-2025)",
    type: "custom-saga",
    category: "saga",
    description: "Do clássico Homem de Aço de Christopher Reeve à intensidade de Henry Cavill e o futuro da DC.",
    parts: [
      {
        name: "A Era Reeve (Os Originais)",
        description: "A lendária série iniciada por Richard Donner.",
        type: "tmdb-collection",
        ids: [8537],
      },
      {
        name: "O Retorno do Ícone",
        description: "A continuação fiel do Superman II (1980) lançada em 2006.",
        type: "movie",
        ids: [1452], // Superman Returns
      },
      {
        name: "O Homem de Aço (Snyderverse)",
        description: "O início do Universo Compartilhado DC.",
        type: "movie",
        ids: [49521, 209112, 141052, 791373], // Man of Steel, BvS, JL, Snyder Cut
      },
      {
        name: "O Futuro da DC (James Gunn)",
        description: "O recomeço do Superman e do novo DCU em 2025.",
        type: "movie",
        ids: [1061474], // Superman (2025)
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Configs — Estúdios (filmografias de produtoras icônicas)
// ---------------------------------------------------------------------------

export const FEATURED_STUDIOS: UniverseConfig[] = [
  {
    id: 10342,
    name: "Studio Ghibli",
    type: "company",
    category: "estudio",
    description: "As animações mais poéticas e emocionantes do Japão",
  },
  {
    id: 3,
    name: "Pixar",
    type: "company",
    category: "estudio",
    description: "Histórias que tocam crianças e adultos igualmente",
  },
  {
    id: 41077,
    name: "A24",
    type: "company",
    category: "estudio",
    description: "Cinema independente ousado e premiado",
  },
  {
    id: 174,
    name: "Warner Bros. Pictures",
    type: "company",
    category: "estudio",
    description: "Um dos pilares da história de Hollywood desde 1923",
  },
  {
    id: 2,
    name: "Walt Disney Pictures",
    type: "company",
    category: "estudio",
    description: "Onde a magia acontece e os sonhos se tornam realidade",
  },
  {
    id: 33,
    name: "Universal Pictures",
    type: "company",
    category: "estudio",
    description: "De monstros clássicos a sucessos modernos de bilheteria",
  },
  {
    id: 5,
    name: "Columbia Pictures",
    type: "company",
    category: "estudio",
    description: "O estúdio da 'Dama com a Tocha' e ícone da Sony",
  },
  {
    id: 4,
    name: "Paramount Pictures",
    type: "company",
    category: "estudio",
    description: "A montanha icônica que trouxe clássicos imortais",
  },
  {
    id: 3172,
    name: "Blumhouse",
    type: "company",
    category: "estudio",
    description: "O estúdio que reinventou o terror moderno",
  },
  {
    id: 521,
    name: "DreamWorks Animation",
    type: "company",
    category: "estudio",
    description: "Shrek, Kung Fu Panda e universos animados únicos",
  },
];

// União de todos os configs — usada na página de detalhe para lookup
export const ALL_FEATURED: UniverseConfig[] = [
  ...FEATURED_SAGAS,
  ...FEATURED_UNIVERSES,
  ...FEATURED_STUDIOS,
];

// ---------------------------------------------------------------------------
// Fetch auxiliar — Bearer Token (server-side apenas)
// ---------------------------------------------------------------------------

async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {}
) {
  const queryParams = new URLSearchParams({ language: "pt-BR", ...params });
  const url = `${BASE_URL}${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetchers específicos por tipo
// ---------------------------------------------------------------------------

async function getTMDBCollection(
  config: UniverseConfig
): Promise<UnifiedCollection | null> {
  const numId = typeof config.id === "string" ? parseInt(config.id) : config.id;
  if (isNaN(numId)) return null;

  const data = await fetchFromTMDB(`/collection/${numId}`);
  if (!data || !data.parts) return null;

  return {
    id: config.id,
    name: config.name || data.name || "Coleção",
    type: "tmdb-collection",
    category: config.category,
    overview: config.description || data.overview || "",
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
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      }),
  };
}

async function getCompanyMovies(
  config: UniverseConfig,
  page: number = 1
): Promise<UnifiedCollection | null> {
  const isUniverse = config.category === "universo";
  
  // Se for universo, buscamos 3 páginas de uma vez para "preencher" os buracos 
  // deixados pela filtragem de franquias
  const pagesToFetch = isUniverse ? [1, 2, 3] : [page];
  
  const fetchedResults = await Promise.all(
    pagesToFetch.map(p => fetchFromTMDB("/discover/movie", {
      with_companies: config.id.toString(),
      sort_by: "primary_release_date.desc",
      include_adult: "false",
      "vote_count.gte": "50",
      without_genres: "99,10770",
      "with_runtime.gte": "70",
      page: p.toString(),
    }))
  );

  const mergedResults = fetchedResults
    .filter(Boolean)
    .flatMap(data => data.results || []);

  if (mergedResults.length === 0) return null;

  const firstData = fetchedResults[0];

  // Injetar filmes extras se houver (ex: Watchmen, Superman James Gunn)
  let finalMovies: CollectionMovie[] = mergedResults.map((movie: any) => ({
    id: movie.id.toString(),
    title: movie.title,
    release_date: movie.release_date || "",
    poster_path: movie.poster_path,
    overview: movie.overview || "",
    vote_average: movie.vote_average || 0,
    backdrop_path: movie.backdrop_path,
    media_type: "movie",
  }));

  if (config.extraMovieIds && config.extraMovieIds.length > 0) {
    const extraMovies = await Promise.all(config.extraMovieIds.map(id => getMovieById(id)));
    const validExtraMovies = extraMovies.filter(Boolean) as CollectionMovie[];
    // Adicionar no início, mas remover duplicatas caso já tenham vindo na busca
    const existingIds = new Set(finalMovies.map(m => m.id));
    const uniqueExtra = validExtraMovies.filter(m => !existingIds.has(m.id));
    finalMovies = [...uniqueExtra, ...finalMovies];
  }

  return {
    id: config.id,
    name: config.name,
    type: "company",
    category: config.category,
    overview: config.description || "",
    poster_path: config.customPosterPath || finalMovies[0]?.poster_path || null,
    backdrop_path: config.customBackdropPath || finalMovies[0]?.backdrop_path || null,
    total_pages: isUniverse ? 1 : (firstData?.total_pages || 1),
    total_results: isUniverse ? finalMovies.length : (firstData?.total_results || 0),
    movies: finalMovies,
  };
}

async function getKeywordMovies(
  config: UniverseConfig,
  page: number = 1
): Promise<UnifiedCollection | null> {
  const isUniverse = config.category === "universo";
  const pagesToFetch = isUniverse ? [1, 2, 3] : [page];

  const fetchedResults = await Promise.all(
    pagesToFetch.map(p => fetchFromTMDB("/discover/movie", {
      with_keywords: config.id.toString(),
      sort_by: "primary_release_date.desc",
      include_adult: "false",
      "vote_count.gte": "30",
      without_genres: "99,10770",
      "with_runtime.gte": "70",
      page: p.toString(),
    }))
  );

  const mergedResults = fetchedResults
    .filter(Boolean)
    .flatMap(data => data.results || []);

  if (mergedResults.length === 0) return null;

  const firstData = fetchedResults[0];

  // Injetar filmes extras se houver
  let finalMovies: CollectionMovie[] = mergedResults.map((movie: any) => ({
    id: movie.id.toString(),
    title: movie.title,
    release_date: movie.release_date || "",
    poster_path: movie.poster_path,
    overview: movie.overview || "",
    vote_average: movie.vote_average || 0,
    backdrop_path: movie.backdrop_path,
    media_type: "movie",
  }));

  if (config.extraMovieIds && config.extraMovieIds.length > 0) {
    const extraMovies = await Promise.all(config.extraMovieIds.map(id => getMovieById(id)));
    const validExtraMovies = extraMovies.filter(Boolean) as CollectionMovie[];
    const existingIds = new Set(finalMovies.map(m => m.id));
    const uniqueExtra = validExtraMovies.filter(m => !existingIds.has(m.id));
    finalMovies = [...uniqueExtra, ...finalMovies];
  }

  return {
    id: config.id,
    name: config.name,
    type: "keyword",
    category: config.category,
    overview: config.description || "",
    poster_path: config.customPosterPath || finalMovies[0]?.poster_path || null,
    backdrop_path: config.customBackdropPath || finalMovies[0]?.backdrop_path || null,
    total_pages: isUniverse ? 1 : (firstData?.total_pages || 1),
    total_results: isUniverse ? finalMovies.length : (firstData?.total_results || 0),
    movies: finalMovies,
  };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export async function getCollectionContent(
  config: UniverseConfig,
  page: number = 1
): Promise<UnifiedCollection | null> {
  try {
    switch (config.type) {
      case "custom-saga":
        return await getCustomSaga(config);
      case "tmdb-collection":
        return await getTMDBCollection(config);
      case "company":
        return await getCompanyMovies(config, page);
      case "keyword":
        return await getKeywordMovies(config, page);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching ${config.category} "${config.name}":`, error);
    return null;
  }
}

export async function getMultipleCollections(
  configs: UniverseConfig[]
): Promise<Record<string | number, UnifiedCollection>> {
  const results = await Promise.all(
    configs.map((config) =>
      getCollectionContent(config, 1).then((collection) => ({
        config,
        collection,
      }))
    )
  );

  const collections: Record<string | number, UnifiedCollection> = {};
  results.forEach(({ config, collection }) => {
    if (collection) {
      collections[config.id] = collection;
    }
  });

  return collections;
}

export async function getCollectionByIdAndCategory(
  id: string | number,
  category: CollectionCategory,
  page: number = 1
): Promise<UnifiedCollection | null> {
  let configs: UniverseConfig[];
  switch (category) {
    case "saga":
      configs = FEATURED_SAGAS;
      break;
    case "universo":
      configs = FEATURED_UNIVERSES;
      break;
    case "estudio":
      configs = FEATURED_STUDIOS;
      break;
    default:
      configs = ALL_FEATURED;
  }

  const decodedId = decodeURIComponent(id.toString());
  const config = configs.find((c) => c.id.toString() === decodedId);
  if (config) return getCollectionContent(config, page);

  // Buscar em sagas customizadas
  const customConfig = CUSTOM_SAGAS.find((c) => c.id.toString() === decodedId);
  if (customConfig) return getCollectionContent(customConfig, 1);

  const numId = typeof id === "string" ? parseInt(id) : id;
  if (isNaN(numId)) return null;

  // Fallback: para sagas, tentar buscar diretamente como tmdb-collection.
  if (category === "saga") {
    return getCollectionContent(
      {
        id: numId,
        name: "",
        type: "tmdb-collection",
        category: "saga",
      },
      page
    );
  }

  return null;
}

/**
 * Busca as sub-coleções (franquias) que compõem um universo.
 * Retorna apenas as que existem e têm filmes.
 */
export async function getUniverseFranchises(
  franchiseConfigs: (number | string | { id: number | string; name: string })[]
): Promise<UnifiedCollection[]> {
  const results = await Promise.all(
    franchiseConfigs.map(async (config) => {
      const id = (typeof config === "object") ? config.id : config;
      const customName = (typeof config === "object") ? config.name : null;
      
      // Tentar achar em sagas customizadas primeiro
      const custom = CUSTOM_SAGAS.find(c => c.id.toString() === id.toString());
      if (custom) {
        const result = await getCollectionContent(custom);
        if (result && customName) result.name = customName;
        return result;
      }

      // Se não for custom, tratar como ID de coleção TMDB padrão
      const numId = typeof id === "string" ? parseInt(id) : id;
      if (isNaN(numId)) return null;

      const collection = await getCollectionContent({
        id: numId,
        name: "",
        type: "tmdb-collection",
        category: "saga",
      });

      if (collection && customName) {
        collection.name = customName;
      }
      return collection;
    })
  );
  return results.filter((r): r is UnifiedCollection => r !== null && r.movies.length > 0);
}

/**
 * Motor das Mega-Sagas: Busca e agrupa conteúdo de múltiplas fontes
 */
async function getCustomSaga(config: UniverseConfig): Promise<UnifiedCollection | null> {
  if (!config.parts) return null;

  const groups: { name: string; description?: string; movies: CollectionMovie[] }[] = [];
  let allMovies: CollectionMovie[] = [];

  for (const part of config.parts) {
    let partMovies: CollectionMovie[] = [];

    if (part.type === "tmdb-collection") {
      const collections = await Promise.all(
        part.ids.map(id => getTMDBCollection({ id, name: "", type: "tmdb-collection", category: "saga" }))
      );
      partMovies = collections.filter(Boolean).flatMap(c => c!.movies);
    } else {
      const movies = await Promise.all(part.ids.map(id => getMovieById(id)));
      partMovies = movies.filter(Boolean) as CollectionMovie[];
    }

    if (partMovies.length > 0) {
      groups.push({
        name: part.name,
        description: part.description,
        movies: partMovies
      });
      allMovies.push(...partMovies);
    }
  }

  if (allMovies.length === 0) return null;

  // Remover duplicatas caso algum filme apareça em múltiplas fontes (ex: BvS e JL)
  const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

  return {
    id: config.id,
    name: config.name,
    type: "custom-saga",
    category: config.category,
    overview: config.description || "",
    poster_path: uniqueMovies[0]?.poster_path || null,
    backdrop_path: uniqueMovies[0]?.backdrop_path || null,
    movies: uniqueMovies,
    groups: groups,
    total_results: uniqueMovies.length,
    total_pages: 1
  };
}

async function getMovieById(id: number): Promise<CollectionMovie | null> {
  const data = await fetchFromTMDB(`/movie/${id}`);
  if (!data) return null;
  return {
    id: data.id.toString(),
    title: data.title,
    release_date: data.release_date,
    poster_path: data.poster_path,
    overview: data.overview,
    vote_average: data.vote_average,
    backdrop_path: data.backdrop_path,
    media_type: "movie"
  };
}

// Compat — lookup em ALL_FEATURED sem categoria
export async function getCollectionById(
  id: number | string
): Promise<UnifiedCollection | null> {
  const config = ALL_FEATURED.find((c) => c.id.toString() === id.toString());
  if (!config) return null;
  return getCollectionContent(config);
}

// ---------------------------------------------------------------------------
// Legacy compat (evitar quebrar imports existentes enquanto migramos)
// ---------------------------------------------------------------------------
export const FEATURED_UNIVERSES_LEGACY = ALL_FEATURED;
export const getUniverseContent = getCollectionContent;
export const getMultipleUniverses = getMultipleCollections;
