// Serviço simplificado para informações de streaming
// Foco apenas em mostrar onde o conteúdo está disponível

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

// Lista de provedores brasileiros populares com informações básicas
export const BRAZILIAN_PROVIDERS = [
  { id: 8, name: "Netflix", color: "#E50914" },
  { id: 119, name: "Prime Video", color: "#00A8E1" },
  { id: 337, name: "Disney+", color: "#113CCF" },
  { id: 384, name: "Max", color: "#B026FF" },
  { id: 350, name: "Apple TV+", color: "#000000" },
  { id: 307, name: "Globoplay", color: "#FF6900" },
  { id: 531, name: "Paramount+", color: "#0066CC" },
  { id: 619, name: "Star+", color: "#000000" },
  { id: 283, name: "Crunchyroll", color: "#FF6600" },
  { id: 167, name: "Pluto TV", color: "#FF6600" },
  { id: 613, name: "Telecine", color: "#1E3A8A" },
  { id: 47, name: "Claro Video", color: "#DC2626" },
  { id: 546, name: "Discovery+", color: "#0066FF" },
];
