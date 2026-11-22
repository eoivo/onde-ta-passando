"use client";

import { useState } from "react";

export default function PersonBiography({
  text,
  isEnglish = false,
}: {
  text: string;
  isEnglish?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 520;

  return (
    <div className="space-y-2 max-w-3xl">
      <p
        className={`text-sm md:text-[15px] text-neutral-300 leading-relaxed whitespace-pre-line ${
          !expanded && isLong ? "line-clamp-5" : ""
        }`}
      >
        {text}
      </p>
      <div className="flex items-center gap-3">
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            {expanded ? "Mostrar menos" : "Ler biografia completa"}
          </button>
        )}
        {isEnglish && (
          <span className="text-[11px] text-neutral-500">
            Biografia disponível apenas em inglês
          </span>
        )}
      </div>
    </div>
  );
}
