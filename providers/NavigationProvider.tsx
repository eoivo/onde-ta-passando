"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
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

export default function NavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = useLoadingStore();

  const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  const startNavigation = (title: string | null = null) => {
    setIsNavigating(true);
    setLoading(true, title);
  };

  useEffect(() => {
    const handleStartNavigation = () => {
      setIsNavigating(true);

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

    const handleCompleteNavigation = () => {
      setIsNavigating(false);
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      const button = target.closest("button");

      if (
        (link &&
          !link.target &&
          link.href &&
          link.href.startsWith(window.location.origin) &&
          !link.hasAttribute("download") &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey) ||
        target.closest("[data-navigate]") ||
        target.closest(".search-result-item") ||
        target.closest("[data-search-result]")
      ) {
        handleStartNavigation();
      }
    };

    const handleFormSubmit = () => {
      handleStartNavigation();
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
      handleStartNavigation();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      document.removeEventListener("submit", handleFormSubmit);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, searchParams, isNavigating, setLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [url, setLoading]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}
