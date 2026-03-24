"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getWatchmodeSources, WatchmodeSource } from "@/services/watchmode-api";
import {
  Info,
  PlayCircle,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  hideHeader?: boolean;
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
  hideHeader = false,
}: EnhancedStreamingProvidersProps) {
  const [watchmodeLinks, setWatchmodeLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchWatchmodeLinks = async () => {
      if (!imdbId) return;
      
      const sources = await getWatchmodeSources(imdbId);
      const links: Record<string, string> = {};
      
      sources.forEach((source: WatchmodeSource) => {
        // Normalizar nomes para garantir compatibilidade com o TMDB (ex: Disney+ vs Disney Plus)
        let normalizedName = source.name
          .replace("+", " Plus")
          .replace(" Video", "")
          .trim();
          
        if (normalizedName === "Disney Plus") links["Disney Plus"] = source.web_url;
        if (normalizedName === "Star Plus") links["Star Plus"] = source.web_url;
        if (normalizedName === "Amazon Prime") links["Prime Video"] = source.web_url;
        if (normalizedName === "HBO Max" || normalizedName === "Max") {
          links["Max"] = source.web_url;
        }
        
        // Também salva o original por segurança
        links[source.name] = source.web_url;
      });
      
      setWatchmodeLinks(links);
    };

    fetchWatchmodeLinks();
  }, [imdbId]);

  const brProviders = providers?.results?.BR;

  if (!brProviders) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] text-center group">
        <div className="bg-red-500/10 p-5 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-500">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-normal font-bebas tracking-wider text-white mb-2 uppercase">
          Conteúdo não disponível
        </h3>
        <p className="text-neutral-500 text-[15px] max-w-sm leading-relaxed">
          Este título ainda não está disponível em nenhuma plataforma de streaming no Brasil.
        </p>
      </div>
    );
  }

  const { flatrate = [], rent = [], buy = [] } = brProviders;

  // Filtrar provedores principais
  const filteredFlatrate = filterMainProviders(flatrate);
  const filteredRent = filterMainProviders(rent);
  const filteredBuy = filterMainProviders(buy);

  const handleProviderClick = (providerId: number, providerName: string) => {
    // Tentar primeiro o link da Watchmode (Direct link)
    const directLink = watchmodeLinks[providerName];
    
    if (directLink) {
      window.open(directLink, "_blank", "noopener,noreferrer");
      return;
    }

    // Se não tiver, tentar o link estático
    const url = PROVIDER_URLS[providerId];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const renderProvider = (
    provider: Provider,
    type: "flatrate" | "rent" | "buy",
    index?: number
  ) => {
    const quality = PROVIDER_QUALITY_MAPPING[provider.provider_id] || "HD";
    // Cria key única combinando provider_id, type e index para evitar duplicatas
    const uniqueKey = `${provider.provider_id}-${type}${
      index !== undefined ? `-${index}` : ""
    }`;

    return (
      <div
        key={uniqueKey}
        className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-[24px] p-6 hover:bg-white/[0.08] transition-all duration-500 group cursor-pointer"
        onClick={() => handleProviderClick(provider.provider_id, provider.provider_name)}
      >
        {/* Header do provedor */}
        <div className="flex items-center mb-6">
          <div className="relative h-14 w-14 mr-4 rounded-2xl overflow-hidden bg-white/5 p-1 border border-white/5">
            <Image
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
              alt={provider.provider_name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-white tracking-tight">
              {provider.provider_name}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                {quality}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500/80">• BR</span>
            </div>
          </div>
        </div>

        {/* Tipo de acesso */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
            {type === "flatrate" ? (
              <>
                <PlayCircle className="h-3 w-3 text-red-500" />
                <span>Assinatura</span>
              </>
            ) : type === "rent" ? (
              <>
                <RefreshCw className="h-3 w-3 text-red-500" />
                <span>Aluguel</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 text-red-500" />
                <span>Compra</span>
              </>
            )}
          </div>
        </div>

        {/* Botão de acesso */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white h-11 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-300"
          size="sm"
        >
          Assistir No Streaming
        </Button>

        {/* Indicador */}
        <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <TrendingUp className="mr-1.5 h-3 w-3 text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-neutral-500">Tendência no Brasil</span>
        </div>
      </div>
    );
  };

  const totalProviders =
    filteredFlatrate.length + filteredRent.length + filteredBuy.length;

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-normal font-bebas tracking-wider uppercase flex items-center gap-3">
            <PlayCircle className="text-red-600 h-8 w-8" />
            Onde Assistir
          </h2>

          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">
            {totalProviders} {totalProviders === 1 ? "opção" : "opções"}
          </div>
        </div>
      )}

      {/* Provedores de assinatura */}
      {filteredFlatrate.length > 0 && (
        <div>
          <h3 className="text-xl font-normal font-bebas mb-6 text-white/50 tracking-widest flex items-center gap-3 uppercase">
            <div className="w-1.5 h-6 bg-red-600 rounded-full" />
            Planos de Assinatura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlatrate.map((provider: Provider, index: number) =>
              renderProvider(provider, "flatrate", index)
            )}
          </div>
        </div>
      )}

      {/* Provedores de aluguel/compra */}
      {(filteredRent.length > 0 || filteredBuy.length > 0) && (
        <div className="pt-4">
          <h3 className="text-xl font-normal font-bebas mb-6 text-white/50 tracking-widest flex items-center gap-3 uppercase">
            <div className="w-1.5 h-6 bg-red-600 rounded-full" />
            Aluguel ou Compra Avulsa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRent.map((provider: Provider, index: number) =>
              renderProvider(provider, "rent", index)
            )}
            {filteredBuy.map((provider: Provider, index: number) =>
              renderProvider(provider, "buy", index)
            )}
          </div>
        </div>
      )}

      {/* Seção de Informações Adicionais */}
      <div className="pt-6 border-t border-white/5">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="info" className="border-none transform-gpu translate-z-0">
            <AccordionTrigger className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-5 hover:no-underline group transition-colors duration-300 hover:bg-white/10 hover:border-red-600/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
                  <Info className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-left">
                  <span className="block text-[15px] font-normal font-bebas text-white uppercase tracking-widest pt-1">
                    Informações sobre disponibilidade
                  </span>
                  <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.1em]">
                    Clique para entender como o catálogo funciona
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 px-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <h4 className="font-bebas text-lg text-white mb-2 flex items-center gap-2 tracking-wide uppercase">
                    <PlayCircle className="h-4 w-4 text-red-600" />
                    Como funciona?
                  </h4>
                  <p className="text-neutral-500 text-[13px] leading-relaxed">
                    Monitoramos em tempo real em quais plataformas de streaming este título está disponível no Brasil.
                  </p>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <h4 className="font-bebas text-lg text-white mb-2 flex items-center gap-2 tracking-wide uppercase">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    Tipos de Acesso
                  </h4>
                  <p className="text-neutral-500 text-[13px] leading-relaxed">
                    <strong className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest mr-1">Streaming:</strong> Catálogo mensal.<br/>
                    <strong className="text-neutral-300 font-bold uppercase text-[10px] tracking-widest mr-1">Avulso:</strong> Aluguel ou Compra.
                  </p>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <h4 className="font-bebas text-lg text-white mb-2 flex items-center gap-2 tracking-wide uppercase">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Observação
                  </h4>
                  <p className="text-neutral-500 text-[13px] leading-relaxed">
                    As informações podem variar. Verifique na plataforma oficial antes de assinar.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
