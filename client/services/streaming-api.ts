// Serviço para informações de plataformas de streaming
// Configurações e metadados das plataformas brasileiras

export interface StreamingProvider {
  id: number;
  name: string;
  color: string;
  logo_path?: string;
  display_priority: number;
  quality: string;
}

// Mapeamento de qualidade por provedor
export const PROVIDER_QUALITY_MAPPING: Record<number, string> = {
  8: "4K UHD", // Netflix
  119: "4K UHD", // Prime Video
  337: "4K HDR", // Disney+
  384: "4K HDR", // Max
  350: "4K Dolby Vision", // Apple TV+
  283: "Full HD", // Crunchyroll
  531: "Full HD", // Paramount+
  619: "Full HD", // Star+
  307: "Full HD", // Globoplay
  100: "HD", // YouTube
  2: "HD", // Google Play Movies & TV
  3: "4K HDR", // Apple TV
  167: "HD", // Pluto TV
  613: "Full HD", // Telecine
  47: "HD", // Claro Video
  546: "Full HD", // Discovery+
};

// Lista de provedores brasileiros populares
// Ordenados por prioridade de exibição (mais populares primeiro)
export const BRAZILIAN_PROVIDERS: StreamingProvider[] = [
  {
    id: 8,
    name: "Netflix",
    color: "#E50914",
    logo_path: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
    display_priority: 1,
    quality: "4K UHD"
  },
  {
    id: 119,
    name: "Prime Video",
    color: "#00A8E1",
    logo_path: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg",
    display_priority: 2,
    quality: "4K UHD"
  },
  {
    id: 337,
    name: "Disney+",
    color: "#113CCF",
    logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
    display_priority: 3,
    quality: "4K HDR"
  },
  {
    id: 384,
    name: "Max",
    color: "#B026FF",
    logo_path: "/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg",
    display_priority: 4,
    quality: "4K HDR"
  },
  {
    id: 350,
    name: "Apple TV+",
    color: "#000000",
    logo_path: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg",
    display_priority: 5,
    quality: "4K Dolby Vision"
  },
  {
    id: 307,
    name: "Globoplay",
    color: "#FF6900",
    logo_path: "/aN4JAKVJVDk5N4BjV5gVCV4chId.jpg",
    display_priority: 6,
    quality: "Full HD"
  },
  {
    id: 531,
    name: "Paramount+",
    color: "#0066CC",
    logo_path: "/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg",
    display_priority: 7,
    quality: "Full HD"
  },
  {
    id: 619,
    name: "Star+",
    color: "#1CE783",
    display_priority: 8,
    quality: "Full HD"
  },
  {
    id: 283,
    name: "Crunchyroll",
    color: "#FF6600",
    logo_path: "/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg",
    display_priority: 9,
    quality: "Full HD"
  },
  {
    id: 613,
    name: "Telecine",
    color: "#1E3A8A",
    display_priority: 10,
    quality: "Full HD"
  },
  {
    id: 167,
    name: "Pluto TV",
    color: "#FF6600",
    display_priority: 11,
    quality: "HD"
  },
  {
    id: 47,
    name: "Claro Video",
    color: "#DC2626",
    display_priority: 12,
    quality: "HD"
  },
  {
    id: 546,
    name: "Discovery+",
    color: "#0066FF",
    logo_path: "/aQ1ritN00jXc8kVdIKbbGdHd0cY.jpg",
    display_priority: 13,
    quality: "Full HD"
  },
];

// Função auxiliar para buscar provider por ID
export function getProviderById(id: number): StreamingProvider | undefined {
  return BRAZILIAN_PROVIDERS.find(provider => provider.id === id);
}

// Função para obter URL completo do logo
export function getProviderLogoUrl(logoPath?: string): string {
  if (!logoPath) return '';
  return `https://image.tmdb.org/t/p/original${logoPath}`;
}

// Providers principais para exibir na home (top 8)
export const FEATURED_PROVIDERS = BRAZILIAN_PROVIDERS.slice(0, 8);
