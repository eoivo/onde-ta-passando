"use client";

import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CopyEmailButtonProps {
  email?: string;
  className?: string;
}

export default function CopyEmailButton({
  email = "ondetapassando@gmail.com",
  className = "",
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("E-mail copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o e-mail");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Clique para copiar o e-mail"
      aria-label={`Copiar e-mail ${email}`}
      className={`h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/25 text-neutral-300 hover:text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shrink-0 leading-none cursor-pointer group ${className}`}
    >
      <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
      <span>{email}</span>
      <span className="pl-1.5 ml-0.5 border-l border-white/10 text-neutral-500 group-hover:text-neutral-300 transition-colors">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}
