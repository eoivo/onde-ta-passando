"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Info,
  PlayCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { PROVIDER_QUALITY_MAPPING } from "@/services/streaming-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedStreamingProvidersProps {
  providers: any;
  title?: string;
  tmdbId?: string;
  imdbId?: string;
  mediaType?: "movie" | "tv";
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const PROVIDER_URLS: Record<number, string> = {
  8: "https://www.netflix.com/br/",
  1796: "https://www.netflix.com/br/", // Netflix Standard with Ads
  119: "https://www.primevideo.com/",
  337: "https://www.disneyplus.com/pt-br",
  384: "https://www.max.com/br/pt",
  350: "https://www.appletvplus.com/",
  3: "https://tv.apple.com/br", // Apple TV
  283: "https://www.crunchyroll.com/pt-br",
  531: "https://www.paramountplus.com/br/",
  619: "https://www.starplus.com/pt-br",
  307: "https://globoplay.globo.com/",
  100: "https://www.youtube.com/feed/storefront",
  2: "https://play.google.com/store/movies",
  167: "https://www.plutoTV.com/br",
  613: "https://www.telecineplay.com.br",
  47: "https://www.clarovideo.com/brasil",
  546: "https://www.discoveryplus.com/br",
  15: "https://www.hulu.com/", // Hulu
  386: "https://www.peacocktv.com/", // Peacock
  387: "https://www.starz.com/", // Starz
};

// Mapeamento para filtrar provedores principais (remover variações)
const MAIN_PROVIDERS: Record<number, string> = {
  8: "Netflix",
  119: "Prime Video",
  337: "Disney Plus",
  384: "Max",
  350: "Apple TV Plus",
  283: "Crunchyroll",
  531: "Paramount Plus",
  619: "Star Plus",
  307: "Globoplay",
  100: "YouTube",
  2: "Google Play Movies & TV",
  3: "Apple TV",
  167: "Pluto TV",
  613: "Telecine",
  47: "Claro Video",
  546: "Discovery Plus",
  1796: "Netflix",
  15: "Hulu",
  386: "Peacock",
  387: "Starz",
};

// Função melhorada para filtrar e deduplicar provedores
const filterMainProviders = (providers: Provider[]): Provider[] => {
  const providerMap = new Map<string, Provider>();

  for (const provider of providers) {
    const providerName = provider.provider_name.toLowerCase();
    let mainProviderName = "";
    let mainProviderId = provider.provider_id;

    // Detectar Netflix (todas variações)
    if (providerName.includes("netflix")) {
      mainProviderName = "Netflix";
      mainProviderId = 8;
    }
    // Detectar Prime Video (todas variações)
    else if (
      providerName.includes("prime") ||
      providerName.includes("amazon")
    ) {
      mainProviderName = "Prime Video";
      mainProviderId = 119;
    }
    // Detectar Disney+ (todas variações)
    else if (providerName.includes("disney")) {
      mainProviderName = "Disney Plus";
      mainProviderId = 337;
    }
    // Detectar Max/HBO (todas variações)
    else if (providerName.includes("max") || providerName.includes("hbo")) {
      mainProviderName = "Max";
      mainProviderId = 384;
    }
    // Detectar Apple TV (todas variações)
    else if (providerName.includes("apple")) {
      mainProviderName = "Apple TV Plus";
      mainProviderId = 350;
    }
    // Detectar Hulu (todas variações)
    else if (providerName.includes("hulu")) {
      mainProviderName = "Hulu";
      mainProviderId = 15;
    }
    // Detectar Paramount+ (todas variações)
    else if (providerName.includes("paramount")) {
      mainProviderName = "Paramount Plus";
      mainProviderId = 531;
    }
    // Detectar Star+ (todas variações)
    else if (providerName.includes("star")) {
      mainProviderName = "Star Plus";
      mainProviderId = 619;
    }
    // Detectar Crunchyroll (todas variações)
    else if (providerName.includes("crunchyroll")) {
      mainProviderName = "Crunchyroll";
      mainProviderId = 283;
    }
    // Detectar Globoplay (todas variações)
    else if (providerName.includes("globo")) {
      mainProviderName = "Globoplay";
      mainProviderId = 307;
    }
    // Detectar YouTube (todas variações)
    else if (providerName.includes("youtube")) {
      mainProviderName = "YouTube";
      mainProviderId = 100;
    }
    // Detectar Pluto TV (todas variações)
    else if (providerName.includes("pluto")) {
      mainProviderName = "Pluto TV";
      mainProviderId = 167;
    }
    // Detectar Telecine (todas variações)
    else if (providerName.includes("telecine")) {
      mainProviderName = "Telecine";
      mainProviderId = 613;
    }
    // Usar mapeamento direto se disponível
    else if (MAIN_PROVIDERS[provider.provider_id]) {
      mainProviderName = MAIN_PROVIDERS[provider.provider_id];
      mainProviderId = provider.provider_id;
    }
    // Caso padrão: usar nome original
    else {
      mainProviderName = provider.provider_name;
      mainProviderId = provider.provider_id;
    }

    // Só adicionar se ainda não temos este provedor principal
    if (!providerMap.has(mainProviderName)) {
      providerMap.set(mainProviderName, {
        provider_id: mainProviderId,
        provider_name: mainProviderName,
        logo_path: provider.logo_path,
      });
    }
  }

  return Array.from(providerMap.values());
};

export default function EnhancedStreamingProviders({
  providers,
  title = "",
  tmdbId = "",
  imdbId = "",
  mediaType = "movie",
}: EnhancedStreamingProvidersProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const brProviders = providers?.results?.BR;

  if (!brProviders) {
    return (
      <div className="text-center p-8 bg-gray-800/50 rounded-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Conteúdo não disponível
        </h3>
        <p className="text-gray-400">
          Este título não está disponível em nenhuma plataforma de streaming no
          Brasil.
        </p>
      </div>
    );
  }

  const { flatrate = [], rent = [], buy = [] } = brProviders;

  // Filtrar provedores principais
  const filteredFlatrate = filterMainProviders(flatrate);
  const filteredRent = filterMainProviders(rent);
  const filteredBuy = filterMainProviders(buy);

  const handleProviderClick = (providerId: number) => {
    const url = PROVIDER_URLS[providerId];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const renderProvider = (
    provider: Provider,
    type: "flatrate" | "rent" | "buy"
  ) => {
    const quality = PROVIDER_QUALITY_MAPPING[provider.provider_id] || "HD";

    return (
      <div
        key={provider.provider_id}
        className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group cursor-pointer"
        onClick={() => handleProviderClick(provider.provider_id)}
      >
        {/* Header do provedor */}
        <div className="flex items-center mb-4">
          <div className="relative h-12 w-14 mr-3 rounded-lg overflow-hidden">
            <Image
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
              alt={provider.provider_name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {provider.provider_name}
            </h3>
            <Badge variant="secondary" className="text-xs mt-1">
              {quality}
            </Badge>
          </div>
        </div>

        {/* Tipo de acesso */}
        <div className="mb-4">
          <Badge
            variant={type === "flatrate" ? "default" : "outline"}
            className="text-sm"
          >
            {type === "flatrate"
              ? "📺 Incluído na assinatura"
              : type === "rent"
              ? "💸 Disponível para aluguel"
              : "💰 Disponível para compra"}
          </Badge>
        </div>

        {/* Botão de acesso */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-full bg-primary hover:bg-primary/80 text-white group-hover:scale-105 transition-transform"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ir para {provider.provider_name}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir {provider.provider_name} em nova aba</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Indicador */}
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <TrendingUp className="mr-1 h-3 w-3" />
          Disponível no Brasil
        </div>
      </div>
    );
  };

  const totalProviders =
    filteredFlatrate.length + filteredRent.length + filteredBuy.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <PlayCircle className="mr-3 text-primary" />
          Onde Assistir
        </h2>

        <Badge variant="outline" className="text-sm">
          {totalProviders} {totalProviders === 1 ? "plataforma" : "plataformas"}
        </Badge>
      </div>

      {/* Provedores de assinatura */}
      {filteredFlatrate.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-400">
            📺 Incluído na Assinatura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlatrate.map((provider: Provider) =>
              renderProvider(provider, "flatrate")
            )}
          </div>
        </div>
      )}

      {/* Provedores de aluguel/compra */}
      {(filteredRent.length > 0 || filteredBuy.length > 0) && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">
            💰 Aluguel ou Compra
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...filteredRent, ...filteredBuy].map((provider: Provider) =>
              renderProvider(
                provider,
                filteredRent.find((p) => p.provider_id === provider.provider_id)
                  ? "rent"
                  : "buy"
              )
            )}
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <details
        className="group bg-primary/10 rounded-xl cursor-pointer"
        open={detailsOpen}
        onClick={() => setDetailsOpen(!detailsOpen)}
      >
        <summary className="p-4 flex justify-between items-center font-medium list-none">
          <span className="flex items-center text-primary">
            <Info className="mr-2 h-5 w-5" />
            Informações sobre disponibilidade
          </span>
          <ChevronDown
            className={`transition-transform duration-300 text-primary ${
              detailsOpen ? "rotate-180" : ""
            }`}
          />
        </summary>
        <div className="p-4 pt-0 text-sm space-y-3">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <h4 className="font-medium text-white mb-2 flex items-center">
              <PlayCircle className="mr-2 h-4 w-4 text-green-400" />
              Como funciona?
            </h4>
            <p className="text-gray-300">
              Mostramos em quais plataformas de streaming este título está
              disponível no Brasil. Clique no botão para ir diretamente para a
              plataforma.
            </p>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <h4 className="font-medium text-white mb-2 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-blue-400" />
              Tipos de Acesso
            </h4>
            <p className="text-gray-300">
              <strong>Assinatura:</strong> Incluído em planos mensais.
              <br />
              <strong>Aluguel:</strong> Pagamento único por período limitado.
              <br />
              <strong>Compra:</strong> Propriedade permanente do título.
            </p>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg">
            <h4 className="font-medium text-white mb-2 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-400" />
              Importante
            </h4>
            <p className="text-gray-300">
              As informações são atualizadas regularmente, mas podem variar.
              Verifique diretamente na plataforma para confirmação de
              disponibilidade e preços.
            </p>
          </div>
        </div>
      </details>

      {/* Botão de atualização */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="text-primary hover:text-primary/80"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar disponibilidade
        </Button>
      </div>
    </div>
  );
}
