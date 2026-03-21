"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingStore } from "@/store/loading-store";

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: (title?: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

// Componente que usa useSearchParams envolto em Suspense
function NavigationEventsHandler({
  onSearchParamsChange,
}: {
  onSearchParamsChange: (params: URLSearchParams | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onSearchParamsChange(searchParams);
  }, [searchParams, onSearchParamsChange]);

  return null;
}

export default function NavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const [searchParamsString, setSearchParamsString] = useState("");
  const { setLoading } = useLoadingStore();

  const handleSearchParamsChange = (params: URLSearchParams | null) => {
    setSearchParamsString(params ? `?${params}` : "");
  };

  const url = `${pathname}${searchParamsString}`;

  const startNavigation = (title: string | null = null) => {
    setIsNavigating(true);
    setLoading(true, title);
  };

  const getTitleFromPath = (path: string): string | null => {
    if (path.includes("/filme/")) return "filme";
    if (path.includes("/serie/")) return "série";
    if (path.includes("/filmes")) return "filmes";
    if (path.includes("/series")) return "séries";
    if (path.includes("/busca")) return "resultados";
    if (path.includes("/sintonize")) return "recomendações";
    if (path.includes("/perfil")) return "perfil";
    if (path.includes("/login")) return "login";
    if (path.includes("/cadastro")) return "cadastro";
    if (path === "/") return "início";
    return null;
  };

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      const isInternalLink =
        link &&
        !link.target &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.hasAttribute("download") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey;

      const isSearchResult =
        target.closest("[data-navigate]") ||
        target.closest(".search-result-item") ||
        target.closest("[data-search-result]");

      if (isInternalLink || isSearchResult) {
        // Ler o path de DESTINO do link clicado, não o pathname atual
        const destinationPath = link
          ? new URL(link.href).pathname
          : pathname;

        const title = getTitleFromPath(destinationPath);

        setIsNavigating(true);
        setLoading(true, title);
      }
    };

    const handleFormSubmit = () => {
      setIsNavigating(true);
      setLoading(true, null);
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    document.addEventListener("submit", handleFormSubmit);

    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }

    const handleBeforeUnload = () => {
      setIsNavigating(true);
      setLoading(true, null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      document.removeEventListener("submit", handleFormSubmit);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, searchParamsString, isNavigating, setLoading]);

  useEffect(() => {
    // Salvar caminho anterior no sessionStorage para uso na página 404
    const currentPath = pathname + searchParamsString;
    const previousPath = sessionStorage.getItem("current_path");
    
    if (previousPath && previousPath !== currentPath) {
      sessionStorage.setItem("previous_path", previousPath);
    }
    
    sessionStorage.setItem("current_path", currentPath);

    const timer = setTimeout(() => {
      setIsNavigating(false);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [url, pathname, searchParamsString, setLoading]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      <Suspense fallback={null}>
        <NavigationEventsHandler
          onSearchParamsChange={handleSearchParamsChange}
        />
      </Suspense>
      {children}
    </NavigationContext.Provider>
  );
}
