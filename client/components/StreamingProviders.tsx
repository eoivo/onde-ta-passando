"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Info,
  PlayCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import ProviderShareButton from "./ProviderShareButton";

interface StreamingProvidersProps {
  providers: any;
  title?: string;
  tmdbId?: string;
  mediaType?: 'movie' | 'tv';
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Mapeamento expandido com padrões de URL mais específicos
const PROVIDER_URLS: Record<number, string> = {
  8: "https://www.netflix.com/br/",
  119: "https://www.primevideo.com/",
  337: "https://www.disneyplus.com/pt-br",
  384: "https://www.max.com/br/pt", // Atualizado para Max
  350: "https://www.appletvplus.com/",
  283: "https://www.crunchyroll.com/pt-br",
  531: "https://www.paramountplus.com/br/",
  619: "https://www.starplus.com/pt-br",
  307: "https://globoplay.globo.com/",
  100: "https://www.youtube.com/feed/storefront",
  2: "https://play.google.com/store/movies",
  3: "https://tv.apple.com/br",
  // Novos provedores brasileiros
  167: "https://www.plutoTV.com/br", // Pluto TV
  613: "https://www.telecineplay.com.br", // Telecine
  47: "https://www.clarovideo.com/brasil", // Claro Video
  546: "https://www.discoveryplus.com/br", // Discovery+
};

// Mapeamento de nomes de qualidade para plataformas específicas
const QUALITY_MAPPING: Record<number, string> = {
  8: "Full HD", // Netflix
  119: "4K", // Prime Video
  337: "4K HDR", // Disney+
  384: "4K HDR", // HBO Max
  350: "4K Dolby Vision", // Apple TV+
  283: "HD", // Crunchyroll
  531: "HD", // Paramount+
  619: "Full HD", // Star+
  307: "HD", // Globoplay
};

// Função para gerar links mais específicos baseados no título
const generateDirectLink = (providerId: number, title?: string, tmdbId?: string, mediaType?: 'movie' | 'tv') => {
  const baseUrl = PROVIDER_URLS[providerId];
  if (!baseUrl) return baseUrl;

  // Netflix - tenta construir URL mais específica
  if (providerId === 8 && tmdbId) {
    // Netflix às vezes usa padrões previsíveis, mas não sempre
    return `${baseUrl}title/${tmdbId}`;
  }

  // Prime Video - padrão mais específico
  if (providerId === 119 && title) {
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${baseUrl}detail/${slug}`;
  }

  // Disney+ - padrão baseado no tipo de mídia
  if (providerId === 337 && title) {
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return mediaType === 'movie' 
      ? `${baseUrl}movies/${slug}`
      : `${baseUrl}series/${slug}`;
  }

  // Apple TV+ - padrão mais específico
  if (providerId === 350 && title) {
    const slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${baseUrl}${mediaType}/${slug}`;
  }

  return baseUrl;
};

export default function StreamingProviders({
  providers,
  title = "",
  tmdbId,
  mediaType = 'movie',
}: StreamingProvidersProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const brProviders = providers?.results?.BR;

  if (!brProviders) {
    return (
      <div className="text-gray-400">
        Este título não está disponível em nenhuma plataforma de streaming no
        Brasil.
      </div>
    );
  }

  const { flatrate = [], rent = [], buy = [] } = brProviders;

  const providerNames = [
    ...flatrate.map((p: any) => p.provider_name),
    ...rent.map((p: any) => p.provider_name),
    ...buy.map((p: any) => p.provider_name),
  ];

  const handleProviderClick = (providerId: number) => {
    const directUrl = generateDirectLink(providerId, title, tmdbId, mediaType);
    if (directUrl) {
      window.open(directUrl, "_blank", "noopener,noreferrer");
    }
  };

  const renderProvider = (
    provider: Provider,
    type: "flatrate" | "rent" | "buy"
  ) => (
    <div
      key={provider.provider_id}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group cursor-pointer"
      onClick={() => handleProviderClick(provider.provider_id)}
    >
      <div className="flex items-center">
        <div className="relative h-8 w-10 mr-3">
          <Image
            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
            alt={provider.provider_name}
            fill
            className="object-contain"
          />
        </div>
        <span className="text-base font-medium">{provider.provider_name}</span>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="bg-gray-900 px-2 py-0.5 rounded-full text-xs w-fit">
          {QUALITY_MAPPING[provider.provider_id] || "HD"}
        </div>

        <button
          className="bg-primary text-white py-1.5 px-4 rounded-md hover:bg-primary/80 transition duration-300 flex items-center group-hover:scale-105 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleProviderClick(provider.provider_id);
          }}
        >
          <PlayCircle className="mr-1 h-4 w-4" />
          Assistir
        </button>
      </div>

      {/* Indicador de link direto */}
      <div className="mt-2 flex items-center text-xs text-gray-400">
        <ExternalLink className="mr-1 h-3 w-3" />
        Link direto para a plataforma
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <PlayCircle className="mr-2 text-primary" />
          Onde Assistir
        </div>
        {providerNames.length > 0 && title && (
          <ProviderShareButton title={title} providers={providerNames} />
        )}
      </h2>

      {flatrate.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {flatrate.map((provider: Provider) =>
            renderProvider(provider, "flatrate")
          )}
        </div>
      )}

      {(rent.length > 0 || buy.length > 0) && (
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-5 mb-6">
          <div className="text-lg mb-3 font-medium">
            {rent.length > 0 && buy.length > 0
              ? "Também disponível para compra ou aluguel:"
              : rent.length > 0
              ? "Também disponível para aluguel:"
              : "Também disponível para compra:"}
          </div>
          <div className="flex flex-wrap gap-4">
            {[...rent, ...buy].map((provider: Provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => handleProviderClick(provider.provider_id)}
              >
                <div className="relative h-6 w-6 mr-2">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span>{provider.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <details
        className="group bg-primary/20 rounded-lg cursor-pointer"
        open={detailsOpen}
        onClick={() => setDetailsOpen(!detailsOpen)}
      >
        <summary className="p-4 flex justify-between items-center font-medium list-none">
          <span className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Informações adicionais
          </span>
          <ChevronDown
            className={`transition-transform duration-300 ${
              detailsOpen ? "rotate-180" : ""
            }`}
          />
        </summary>
        <div className="p-4 pt-0 text-sm">
          <p className="mb-2">
            Este título pode estar disponível em diferentes qualidades e idiomas
            dependendo da plataforma de streaming.
          </p>
          <p>
            Algumas plataformas podem oferecer um período de teste gratuito ou
            promoções especiais para novos assinantes.
          </p>
        </div>
      </details>

      <div className="mt-6 flex justify-end">
        <button className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <RefreshCw className="mr-1 h-4 w-4" />
          Atualizar disponibilidade
        </button>
      </div>
    </div>
  );
}
