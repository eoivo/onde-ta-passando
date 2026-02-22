"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, Film, Tv, Home, X, User, BookMarked, LogOut, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import SearchSuggestions from "./SearchSuggestions";
import MobileSearchOverlay from "./MobileSearchOverlay";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/UserAvatar";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Estado para controlar o Sheet
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMobile();
  const searchFormRef = useRef<HTMLFormElement>(null);
  const { user, profile, isAuthenticated, logout, refreshProfile } = useAuth();

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
      setIsSheetOpen(false); // Fecha o sheet após a busca
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
    setIsSheetOpen(false); // Fecha o sheet quando clica em uma sugestão
  };

  const handleNavClick = () => {
    setIsSheetOpen(false);
  };

  const scrollToCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSheetOpen(false);

    if (pathname === "/") {
      const element = document.getElementById("colecoes");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#colecoes");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pb-4 ${isScrolled
          ? "bg-gray-950/95 backdrop-blur-md pb-0 shadow-lg"
          : "bg-gradient-to-b from-black/95 via-black/40 to-transparent"
          }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/logo.png"
                  alt="Onde Tá Passando? Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text leading-tight max-w-[120px] md:max-w-none tracking-tighter uppercase">
                  Onde Tá Passando?
                </h1>
              </div>
            </Link>

            {!isMobile && (
              <nav className="hidden md:flex items-center gap-10 ml-16">
                {[
                  { href: "/", label: "Início" },
                  { href: "/filmes", label: "Filmes" },
                  { href: "/series", label: "Séries" },
                  { href: "/sintonize", label: "Sintonize", isNew: true },
                ].map(({ href, label, isNew }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleNavClick}
                    className={`text-[13px] font-bold ${pathname === href ? "text-red-500" : "text-white/60 hover:text-white"} transition-all duration-300 tracking-[0.1em] uppercase relative group flex items-center gap-1.5`}
                  >
                    {label}
                    {isNew && (
                      <span className="bg-red-500 text-[8px] font-black px-1 py-0.5 rounded-sm text-white animate-pulse">NEW</span>
                    )}
                    <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full ${pathname === href ? "w-full opacity-100" : "w-0 opacity-0 group-hover:opacity-100"}`}></span>
                  </Link>
                ))}
                <button
                  onClick={scrollToCollections}
                  className="text-[13px] font-bold text-white/60 hover:text-white transition-all duration-300 tracking-[0.1em] uppercase relative group"
                >
                  Coleções
                  <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-8">
            {!isMobile && (
              <form
                ref={searchFormRef}
                onSubmit={handleSearch}
                className={`relative hidden md:flex items-center transition-all duration-500 ease-out rounded-full border border-white/10
                ${isSearchFocused
                    ? "w-80 bg-black/60 border-red-500/40 ring-4 ring-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    : "w-10 hover:w-64 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center w-full relative">
                  <div className="absolute left-3 pointer-events-none">
                    <Search className={`h-4 w-4 transition-colors duration-300 ${isSearchFocused ? "text-red-500" : "text-white/40"}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar filme ou série..."
                    className={`w-full border-0 bg-transparent text-white text-sm py-2.5 focus:ring-0 focus:outline-none rounded-full transition-all duration-300 ${isSearchFocused
                      ? "pl-10 pr-14 opacity-100"
                      : "pl-10 pr-4 opacity-0 hover:opacity-100 placeholder-transparent hover:placeholder-white/20"
                      }`}
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={() => setIsSearchFocused(false)}
                  />

                  {searchQuery && isSearchFocused && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-12 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3 text-white/40" />
                    </button>
                  )}

                  {isSearchFocused && (
                    <button
                      type="submit"
                      className="absolute right-1.5 p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <SearchSuggestions
                  query={searchQuery}
                  visible={showSuggestions}
                  onItemClick={closeSuggestions}
                />
              </form>
            )}

            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="relative overflow-hidden group"
                onClick={() => setIsSearchOverlayOpen(true)}
                aria-label="Abrir busca"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-full transition-opacity duration-300"></div>
                <Search className="h-5 w-5 group-hover:text-red-500 transition-colors duration-300" />
              </Button>
            )}

            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                  className="bg-gray-900 text-white border-gray-800 flex flex-col h-full overflow-y-auto"
                >
                  {/* Logo */}
                  <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-gray-800">
                    <div className="relative w-14 h-14 mb-2">
                      <Image
                        src="/images/logo.png"
                        alt="Onde Tá Passando? Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                      Onde Tá Passando?
                    </h2>
                  </div>

                  {/* Navegação principal */}
                  <nav className="flex flex-col gap-1 mt-4">
                    {[
                      { href: "/", label: "Início", icon: <Home className="h-5 w-5 text-red-500" /> },
                      { href: "/filmes", label: "Filmes", icon: <Film className="h-5 w-5 text-red-500" /> },
                      { href: "/series", label: "Séries", icon: <Tv className="h-5 w-5 text-red-500" /> },
                      { href: "/sintonize", label: "Sintonize", icon: <Search className="h-5 w-5 text-red-500" />, isNew: true },
                    ].map(({ href, label, icon, isNew }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={handleNavClick}
                        className="flex items-center gap-4 px-3 py-3.5 rounded-xl group transition-all duration-200 hover:bg-white/5 active:bg-white/10"
                      >
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-700/10 group-hover:from-red-500/20 group-hover:to-red-700/20 transition-all duration-200">
                          {icon}
                        </div>
                        <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-200 flex items-center gap-2">
                          {label}
                          {isNew && (
                            <span className="bg-red-500 text-[8px] font-black px-1.5 py-0.5 rounded-sm text-white animate-pulse">NEW</span>
                          )}
                        </span>
                      </Link>
                    ))}
                    <button
                      onClick={scrollToCollections}
                      className="flex items-center gap-4 px-3 py-3.5 rounded-xl group transition-all duration-200 hover:bg-white/5 active:bg-white/10 text-left"
                    >
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-700/10 group-hover:from-red-500/20 group-hover:to-red-700/20 transition-all duration-200">
                        <BookMarked className="h-5 w-5 text-red-500" />
                      </div>
                      <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-200">
                        Coleções
                      </span>
                    </button>
                  </nav>

                  {/* Zona de conta */}
                  <div className="mt-auto border-t border-gray-800 pt-4 pb-2 flex flex-col gap-1">
                    {isAuthenticated ? (
                      <>
                        {/* Info do usuário */}
                        <div className="flex items-center gap-3 px-3 py-2 mb-1">
                          <UserAvatar
                            profileImageUrl={profile?.profileImage?.url}
                            name={profile?.name}
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white leading-tight">
                              {user?.name?.split(" ")[0]}
                            </span>
                            <span className="text-xs text-white/40 leading-tight">
                              {user?.email}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            refreshProfile();
                            router.push("/perfil");
                            handleNavClick();
                          }}
                          className="flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 hover:bg-white/5 active:bg-white/10 w-full text-left"
                        >
                          <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-200">
                            <User className="h-5 w-5 text-white/60" />
                          </div>
                          <span className="text-base font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                            Meu Perfil
                          </span>
                        </button>

                        <button
                          onClick={() => { logout(); handleNavClick(); }}
                          className="flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 hover:bg-red-500/10 active:bg-red-500/20 w-full text-left"
                        >
                          <div className="p-2.5 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-200">
                            <LogOut className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="text-base font-medium text-red-500/80 group-hover:text-red-400 transition-colors duration-200">
                            Sair
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { router.push("/login"); handleNavClick(); }}
                          className="flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 hover:bg-white/5 active:bg-white/10 w-full text-left"
                        >
                          <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-200">
                            <User className="h-5 w-5 text-white/60" />
                          </div>
                          <span className="text-base font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                            Entrar
                          </span>
                        </button>

                        <button
                          onClick={() => { router.push("/cadastro"); handleNavClick(); }}
                          className="flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 hover:bg-white/5 active:bg-white/10 w-full text-left"
                        >
                          <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-200">
                            <UserPlus className="h-5 w-5 text-white/60" />
                          </div>
                          <span className="text-base font-medium text-white/80 group-hover:text-white transition-colors duration-200">
                            Cadastrar
                          </span>
                        </button>
                      </>
                    )}

                    {/* Links legais */}
                    <div className="flex items-center gap-3 px-3 pt-3 pb-1">
                      <Link href="/privacidade" onClick={handleNavClick} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                        Privacidade
                      </Link>
                      <span className="text-white/15 text-xs">·</span>
                      <Link href="/termos" onClick={handleNavClick} className="text-xs text-white/25 hover:text-white/50 transition-colors">
                        Termos
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}


            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-9 h-9 p-0 rounded-full overflow-hidden focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent"
                  >
                    <div className="relative flex items-center justify-center w-full h-full group">
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-red-500/10 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 border border-red-500/50 transition-opacity duration-300"></div>

                      <UserAvatar
                        profileImageUrl={profile?.profileImage?.url}
                        name={profile?.name}
                        size="sm"
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900 border-gray-800 text-white"
                >
                  <div className="px-2 py-2 text-xs text-gray-400">
                    Olá, {user?.name?.split(" ")[0]}
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      refreshProfile();
                      router.push("/perfil");
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="hover:bg-gray-800 cursor-pointer text-red-500 hover:text-red-400"
                    onClick={logout}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="rounded-full text-white/80 hover:bg-transparent hover:text-white flex items-center justify-center gap-2 transition-colors duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 bg-red-500/10 transition-opacity duration-300"></div>
                <User className="h-4 w-4" />
                <span>Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <MobileSearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
      />
    </>
  );
}
