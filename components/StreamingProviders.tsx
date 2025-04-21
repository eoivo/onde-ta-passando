"use client";

import Image from "next/image";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProviderShareButton from "./ProviderShareButton";

interface StreamingProvidersProps {
  providers: any;
  title?: string;
}

const PROVIDER_URLS: Record<number, string> = {
  8: "https://www.netflix.com/br/",
  119: "https://www.primevideo.com/",
  337: "https://www.disneyplus.com/pt-br",
  384: "https://www.hbomax.com/br/pt",
  350: "https://www.appletvplus.com/",
  283: "https://www.crunchyroll.com/pt-br",
  531: "https://www.paramountplus.com/br/",
  619: "https://www.starplus.com/pt-br",
  307: "https://globoplay.globo.com/",
  100: "https://www.youtube.com/feed/storefront",
  2: "https://play.google.com/store/movies",
  3: "https://tv.apple.com/br",
};

export default function StreamingProviders({
  providers,
  title = "",
}: StreamingProvidersProps) {
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

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
    const url = PROVIDER_URLS[providerId];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const renderProvider = (provider: any) => (
    <TooltipProvider key={provider.provider_id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex flex-col items-center group cursor-pointer relative"
            onClick={() => handleProviderClick(provider.provider_id)}
            onMouseEnter={() => setShowTooltip(provider.provider_id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden group-hover:ring-2 ring-primary transition-all">
              <Image
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs mt-1 text-center">
              {provider.provider_name}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {PROVIDER_URLS[provider.provider_id]
            ? `Abrir no ${provider.provider_name}`
            : `Link para ${provider.provider_name} não disponível`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1"></div>
        {providerNames.length > 0 && title && (
          <ProviderShareButton title={title} providers={providerNames} />
        )}
      </div>

      {flatrate.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Streaming</h3>
          <div className="flex flex-wrap gap-2">
            {flatrate.map(renderProvider)}
          </div>
        </div>
      )}

      {rent.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Alugar</h3>
          <div className="flex flex-wrap gap-2">{rent.map(renderProvider)}</div>
        </div>
      )}

      {buy.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Comprar</h3>
          <div className="flex flex-wrap gap-2">{buy.map(renderProvider)}</div>
        </div>
      )}
    </div>
  );
}
