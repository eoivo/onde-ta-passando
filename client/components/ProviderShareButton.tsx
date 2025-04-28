"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProviderShareButtonProps {
  title: string;
  providers?: string[];
  className?: string;
}

export default function ProviderShareButton({
  title,
  providers = [],
  className,
}: ProviderShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const providersText =
    providers.length > 0 ? `\nDisponível em: ${providers.join(", ")}` : "";

  const shareText = `${title}${providersText}\nSaiba mais em:`;

  const copyToClipboard = () => {
    const textToCopy = `${shareText} ${currentUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank"
    );
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      "_blank"
    );
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareText} ${currentUrl}`
      )}`,
      "_blank"
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white border border-red-600/20 transition-colors",
            className
          )}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          <p className="text-sm font-medium mb-2">Compartilhar em:</p>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
            {copied ? "Link copiado!" : "Copiar link"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
            onClick={shareOnWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[#1DA1F2] hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
            onClick={shareOnTwitter}
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10"
            onClick={shareOnFacebook}
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10"
            onClick={shareOnLinkedIn}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
