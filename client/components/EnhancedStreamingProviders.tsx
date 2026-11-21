"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getWatchmodeSources, WatchmodeSource } from "@/services/watchmode-api";
import {
  Info,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { PROVIDER_QUALITY_MAPPING } from "@/services/streaming-api";

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
  9: "https://www.primevideo.com/",
  337: "https://www.disneyplus.com/pt-br",
  384: "https://www.max.com/br/pt",
  1899: "https://www.max.com/br/pt",
  350: "https://www.appletvplus.com/",
  3: "https://tv.apple.com/br", // Apple TV
  283: "https://www.crunchyroll.com/pt-br",
  531: "https://www.paramountplus.com/br/",
  619: "https://www.starplus.com/pt-br",
  307: "https://globoplay.globo.com/",
  100: "https://www.youtube.com/feed/storefront",
  2: "https://play.google.com/store/movies",
  300: "https://pluto.tv/br", // Pluto TV (ID real no TMDB)
  167: "https://www.clarovideo.com/brasil", // Claro video (ID 167 no TMDB)
  47: "https://www.clarovideo.com/brasil",
  613: "https://www.telecineplay.com.br",
  546: "https://www.discoveryplus.com/br",
  15: "https://www.hulu.com/", // Hulu
  386: "https://www.peacocktv.com/", // Peacock
  387: "https://www.starz.com/", // Starz
};

// Mapeamento para filtrar provedores principais (remover variações)
const MAIN_PROVIDERS: Record<number, string> = {
  8: "Netflix",
  1796: "Netflix",
  119: "Prime Video",
  9: "Prime Video",
  337: "Disney Plus",
  384: "Max",
  1899: "Max",
  350: "Apple TV Plus",
  283: "Crunchyroll",
  531: "Paramount Plus",
  619: "Star Plus",
  307: "Globoplay",
  100: "YouTube",
  2: "Google Play Movies & TV",
  3: "Apple TV",
  300: "Pluto TV",
  167: "Claro Video",
  47: "Claro Video",
  613: "Telecine",
  546: "Discovery Plus",
  15: "Hulu",
  386: "Peacock",
  387: "Starz",
};

// Logos oficiais canônicos no TMDB para evitar que um provedor principal herde o logo de um canal/add-on
const CANONICAL_LOGOS: Record<number, string> = {
  8: "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
  119: "/pvske1MyAoymrs5bguRfVqYiM9a.jpg",
  337: "/97yvRBw1GzX7fXprcF80er19ot.jpg",
  384: "/jbe4gVSfRlbPTdESXhEKpornsfu.jpg",
  350: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg",
  531: "/h5DcR0J2EESLitnhR8xLG1QymTE.jpg",
  283: "/fzN5Jok5Ig1eJ7gyNGoMhnLSCfh.jpg",
};

// Função melhorada para filtrar e deduplicar provedores
const filterMainProviders = (providers: Provider[]): Provider[] => {
  const providerMap = new Map<string, Provider>();

  // Ordena para que provedores oficiais diretos (sem "Channel") sejam processados primeiro
  const sorted = [...providers].sort((a, b) => {
    const aIsChannel = /channel/i.test(a.provider_name) ? 1 : 0;
    const bIsChannel = /channel/i.test(b.provider_name) ? 1 : 0;
    return aIsChannel - bIsChannel;
  });

  for (const provider of sorted) {
    const providerName = provider.provider_name.toLowerCase();
    const isAddOnChannel =
      providerName.includes("amazon channel") ||
      providerName.includes("apple tv channel") ||
      providerName.includes("claro") && providerName.includes("channel");

    // Ignora add-ons de terceiros vendidos dentro do Prime/Apple/Claro (ex: "HBO Max Amazon Channel",
    // "Crunchyroll Amazon Channel") para não exibir um falso "Prime Video" com logo da HBO/Crunchyroll
    if (isAddOnChannel) {
      continue;
    }

    let mainProviderName = "";
    let mainProviderId = provider.provider_id;

    // 1) Mapeamento direto por ID oficial do TMDB tem prioridade
    if (MAIN_PROVIDERS[provider.provider_id]) {
      mainProviderName = MAIN_PROVIDERS[provider.provider_id];
      mainProviderId =
        provider.provider_id === 1796 ? 8 :
        provider.provider_id === 9 ? 119 :
        provider.provider_id === 1899 ? 384 :
        provider.provider_id;
    }
    // 2) Fallback por nome para variações diretas da própria plataforma
    else if (providerName.includes("netflix")) {
      mainProviderName = "Netflix";
      mainProviderId = 8;
    } else if (providerName.includes("max") || providerName.includes("hbo")) {
      mainProviderName = "Max";
      mainProviderId = 384;
    } else if (providerName.includes("disney")) {
      mainProviderName = "Disney Plus";
      mainProviderId = 337;
    } else if (providerName.includes("crunchyroll")) {
      mainProviderName = "Crunchyroll";
      mainProviderId = 283;
    } else if (providerName.includes("paramount")) {
      mainProviderName = "Paramount Plus";
      mainProviderId = 531;
    } else if (providerName.includes("globo")) {
      mainProviderName = "Globoplay";
      mainProviderId = 307;
    } else if (providerName.includes("telecine")) {
      mainProviderName = "Telecine";
      mainProviderId = 613;
    } else if (providerName.includes("pluto")) {
      mainProviderName = "Pluto TV";
      mainProviderId = 300;
    } else if (providerName.includes("claro")) {
      mainProviderName = "Claro Video";
      mainProviderId = 167;
    } else if (providerName.includes("apple")) {
      mainProviderName = "Apple TV Plus";
      mainProviderId = 350;
    } else if (providerName.includes("prime") || providerName.includes("amazon")) {
      mainProviderName = "Prime Video";
      mainProviderId = 119;
    } else if (providerName.includes("youtube")) {
      mainProviderName = "YouTube";
      mainProviderId = 100;
    } else {
      mainProviderName = provider.provider_name;
      mainProviderId = provider.provider_id;
    }

    if (!providerMap.has(mainProviderName)) {
      providerMap.set(mainProviderName, {
        provider_id: mainProviderId,
        provider_name: mainProviderName,
        logo_path: CANONICAL_LOGOS[mainProviderId] || provider.logo_path,
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
    const uniqueKey = `${provider.provider_id}-${type}${
      index !== undefined ? `-${index}` : ""
    }`;

    const accessLabel =
      type === "flatrate" ? "Assinatura" : type === "rent" ? "Aluguel" : "Compra";

    return (
      <div
        key={uniqueKey}
        onClick={() => handleProviderClick(provider.provider_id, provider.provider_name)}
        className="flex items-center justify-between gap-4 px-5 py-4 rounded-[20px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 transition-colors duration-200 group cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-[52px] w-[52px] rounded-[14px] overflow-hidden bg-black border border-white/[0.08] flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
              alt={provider.provider_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold text-white tracking-tight truncate leading-tight">
              {provider.provider_name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-400 font-medium whitespace-nowrap">
              <span>{accessLabel}</span>
              <span className="text-neutral-600">•</span>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-300 text-[9.5px] font-bold uppercase tracking-wider leading-none whitespace-nowrap shrink-0">
                {quality}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="h-9 px-4 rounded-full bg-white/[0.06] border border-white/10 group-hover:bg-white/[0.12] group-hover:border-white/25 text-neutral-200 group-hover:text-white text-[11px] font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 flex-shrink-0 transition-colors duration-200"
        >
          <span>Assistir</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors duration-200" />
        </button>
      </div>
    );
  };

  const totalProviders =
    filteredFlatrate.length + filteredRent.length + filteredBuy.length;

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-normal font-bebas tracking-wider uppercase leading-none">
            Onde Assistir
          </h2>

          <span className="h-6 px-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-400 inline-flex items-center leading-none">
            {totalProviders} {totalProviders === 1 ? "opção" : "opções"}
          </span>
        </div>
      )}

      {/* Provedores de assinatura */}
      {filteredFlatrate.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-neutral-400 tracking-[0.16em] flex items-center gap-2 uppercase">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            Incluído na assinatura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl">
            {filteredFlatrate.map((provider: Provider, index: number) =>
              renderProvider(provider, "flatrate", index)
            )}
          </div>
        </div>
      )}

      {/* Provedores de aluguel/compra */}
      {(filteredRent.length > 0 || filteredBuy.length > 0) && (
        <div className="space-y-3 pt-2">
          <h3 className="text-[11px] font-bold text-neutral-400 tracking-[0.16em] flex items-center gap-2 uppercase">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            Aluguel ou compra avulsa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl">
            {filteredRent.map((provider: Provider, index: number) =>
              renderProvider(provider, "rent", index)
            )}
            {filteredBuy.map((provider: Provider, index: number) =>
              renderProvider(provider, "buy", index)
            )}
          </div>
        </div>
      )}

      {/* Nota discreta de rodapé */}
      <div className="pt-2 flex items-center gap-2 text-xs text-neutral-500">
        <Info className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
        <span>
          Disponibilidade monitorada em tempo real para o catálogo do Brasil. Verifique na plataforma oficial antes de assinar.
        </span>
      </div>
    </div>
  );
}
