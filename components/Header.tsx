"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, Film, Tv, Home, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import SearchSuggestions from "./SearchSuggestions";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const isMobile = useMobile();
  const searchFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchFormRef.current &&
        !searchFormRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.length > 1) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 1);
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-sm"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/logo.png"
                alt="Onde Tá Passando? Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                Onde Tá Passando?
              </h1>
            </div>
          </Link>

          {!isMobile && (
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <Link
                href="/"
                className="text-white/80 hover:text-white transition"
              >
                Início
              </Link>
              <Link
                href="/filmes"
                className="text-white/80 hover:text-white transition"
              >
                Filmes
              </Link>
              <Link
                href="/series"
                className="text-white/80 hover:text-white transition"
              >
                Séries
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <form
            ref={searchFormRef}
            onSubmit={handleSearch}
            className={`relative hidden md:flex items-center transition-all duration-300 ease-in-out rounded-full 
              ${
                isSearchFocused
                  ? "w-72 bg-black/60 border border-gray-700/70"
                  : "w-64 bg-black/40 border border-gray-700/50"
              }`}
          >
            <input
              type="text"
              placeholder="Buscar filme ou série..."
              className={`w-full border-0 bg-transparent text-white pl-4 pr-14 py-2 focus:ring-0 focus:outline-none rounded-full transition-all duration-300 ${
                isSearchFocused
                  ? "placeholder-white/80"
                  : "placeholder-white/50"
              }`}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="absolute right-1 flex items-center">
              {searchQuery && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={clearSearch}
                  className="h-7 w-7 p-0 mr-0.5 hover:bg-white/10 rounded-full"
                >
                  <X className="h-4 w-4 text-white/70" />
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={`rounded-full aspect-square h-8 transition-all duration-300 ${
                  isSearchFocused
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <SearchSuggestions
              query={searchQuery}
              visible={showSuggestions}
              onItemClick={closeSuggestions}
            />
          </form>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="relative overflow-hidden group"
              onClick={() => router.push("/busca")}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-full transition-opacity duration-300"></div>
              <Search className="h-5 w-5 group-hover:text-red-500 transition-colors duration-300" />
            </Button>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden group"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-full transition-opacity duration-300"></div>
                  <Menu className="h-5 w-5 group-hover:text-red-500 transition-colors duration-300" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-gray-900 text-white border-gray-800"
              >
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="relative w-16 h-16 mb-2">
                    <Image
                      src="/images/logo.png"
                      alt="Onde Tá Passando? Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                    Onde Tá Passando?
                  </h2>
                </div>

                <form
                  onSubmit={handleSearch}
                  className="relative flex items-center mb-8 rounded-full bg-black/60 border border-gray-700/70 mx-2"
                >
                  <div className="relative flex items-center w-full">
                    <input
                      type="text"
                      placeholder="Buscar filme ou série..."
                      className="w-full border-0 bg-transparent text-white pl-4 pr-14 py-2 focus:ring-0 focus:outline-none rounded-full placeholder-white/70"
                      value={searchQuery}
                      onChange={handleInputChange}
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={clearSearch}
                        className="absolute right-9 h-6 w-6 p-0.5 hover:bg-white/10 rounded-full"
                      >
                        <X className="h-4 w-4 text-white/70" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 rounded-full aspect-square h-8 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <nav className="flex flex-col gap-6 mt-8">
                  <Link
                    href="/"
                    className="flex items-center gap-3 text-lg group transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="p-2 rounded-full bg-gradient-to-r from-red-500/10 to-red-700/10 group-hover:from-red-500/20 group-hover:to-red-700/20 transition-all duration-300">
                      <Home className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      Início
                    </span>
                  </Link>
                  <Link
                    href="/filmes"
                    className="flex items-center gap-3 text-lg group transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="p-2 rounded-full bg-gradient-to-r from-red-500/10 to-red-700/10 group-hover:from-red-500/20 group-hover:to-red-700/20 transition-all duration-300">
                      <Film className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      Filmes
                    </span>
                  </Link>
                  <Link
                    href="/series"
                    className="flex items-center gap-3 text-lg group transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="p-2 rounded-full bg-gradient-to-r from-red-500/10 to-red-700/10 group-hover:from-red-500/20 group-hover:to-red-700/20 transition-all duration-300">
                      <Tv className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-red-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      Séries
                    </span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
