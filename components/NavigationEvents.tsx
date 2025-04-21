"use client";

import { useEffect, Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingStore } from "@/store/loading-store";

function SearchParamsWatcher({
  onUpdate,
}: {
  onUpdate: (params: URLSearchParams | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onUpdate(searchParams);
  }, [searchParams, onUpdate]);

  return null;
}

export default function NavigationEvents() {
  const pathname = usePathname();
  const { setLoading } = useLoadingStore();
  const [params, setParams] = useState<URLSearchParams | null>(null);

  const handleSearchParamsUpdate = (newParams: URLSearchParams | null) => {
    setParams(newParams);
  };

  useEffect(() => {
    const handleRouteChangeStart = () => {
      let title = null;

      if (pathname?.includes("/filme/")) {
        title = "filme";
      } else if (pathname?.includes("/serie/")) {
        title = "série";
      } else if (pathname?.includes("/filmes")) {
        title = "filmes";
      } else if (pathname?.includes("/series")) {
        title = "séries";
      } else if (pathname?.includes("/busca")) {
        title = "resultados";
      }

      setLoading(true, title);
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    };

    window.addEventListener("beforeunload", handleRouteChangeStart);

    handleRouteChangeComplete();

    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart);
    };
  }, [pathname, params, setLoading]);

  return (
    <Suspense fallback={null}>
      <SearchParamsWatcher onUpdate={handleSearchParamsUpdate} />
    </Suspense>
  );
}
