"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingStore } from "@/store/loading-store";

export default function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useLoadingStore();

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
  }, [pathname, searchParams, setLoading]);

  return null;
}
