import React, { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-xl text-gray-400">Carregando resultados...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
