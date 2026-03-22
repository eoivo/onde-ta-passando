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
import { motion } from "framer-motion";
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



  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-700 pb-4 ${isScrolled
          ? "bg-black/90 backdrop-blur-xl pb-0 shadow-2xl"
          : "bg-gradient-to-b from-black/95 via-black/60 to-transparent"
          }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-2 group shrink-0 translate-y-[3px]"
            >
              <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/logos/icon.png"
                  alt="Onde Tá Passando? Logo"
                  fill
                  sizes="(max-width: 768px) 32px, 40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col translate-y-[1.5px]">
                <h1 className="text-xl md:text-2xl font-normal font-bebas leading-none tracking-wider uppercase">
                  <span className="text-white">Onde Tá </span>
                  <span className="text-red-600">Passando?</span>
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


                {/* Busca no Desktop integrada ao NAV */}
                <form
                  ref={searchFormRef}
                  onSubmit={handleSearch}
                  className="relative hidden md:flex items-center"
                >
                  <div className="flex items-center relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSearchFocused) {
                          searchFormRef.current?.querySelector('input')?.focus();
                        }
                      }}
                      className="p-1 transition-transform duration-300 z-10"
                    >
                      <Search className="h-4 w-4 text-red-600" />
                    </button>
                    
                    <input
                      type="text"
                      placeholder="Buscar filme ou série..."
                      className={`bg-transparent text-white text-sm py-1 focus:ring-0 focus:outline-none transition-all duration-500 ease-in-out ${isSearchFocused
                          ? "w-64 opacity-100 ml-2"
                          : "w-0 opacity-0 pointer-events-none ml-0"
                        }`}
                      value={searchQuery}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      onBlur={() => setIsSearchFocused(false)}
                    />

                    {searchQuery && isSearchFocused && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearSearch();
                        }}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                      >
                        <X className="h-3 w-3 text-white/40" />
                      </button>
                    )}
                  </div>

                  <SearchSuggestions
                    query={searchQuery}
                    visible={showSuggestions && isSearchFocused}
                    onItemClick={closeSuggestions}
                  />
                </form>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-8">


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
                  hideClose
                  className="bg-black/95 backdrop-blur-2xl text-white border-l border-white/10 flex flex-col h-full p-0 overflow-hidden"
                  data-lenis-prevent
                >
                  {/* Fundo com gradiente sutil */}
                  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-600/40 via-transparent to-transparent" />

                  <div className="relative z-10 flex flex-col h-full overflow-y-auto scrollbar-hide pt-4">
                    {/* Header do Menu */}
                    <div className="px-6 pt-12 pb-8 flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-16 h-16 mb-4"
                      >
                        <Image
                          src="/images/logos/icon.png"
                          alt="Logo"
                          fill
                          className="object-contain"
                        />
                      </motion.div>
                      <h2 className="text-2xl font-normal font-bebas tracking-widest uppercase">
                        <span className="text-white">Onde Tá </span>
                        <span className="text-red-600">Passando?</span>
                      </h2>
                    </div>

                    {/* Navegação Principal */}
                    <nav className="flex-1 px-4 space-y-2">
                      {[
                        { href: "/", label: "Início", icon: <Home className="h-5 w-5" /> },
                        { href: "/filmes", label: "Filmes", icon: <Film className="h-5 w-5" /> },
                        { href: "/series", label: "Séries", icon: <Tv className="h-5 w-5" /> },
                        { href: "/sintonize", label: "Sintonize", icon: <Search className="h-5 w-5" />, isNew: true },
                      ].map(({ href, label, icon, isNew }, idx) => (
                        <motion.div
                          key={href}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 + idx * 0.1 }}
                        >
                          <Link
                            href={href}
                            onClick={handleNavClick}
                            className={`flex items-center justify-between p-4 rounded-2xl group transition-all duration-300 ${
                              pathname === href 
                                ? "bg-red-600/10 border border-red-600/20" 
                                : "hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${pathname === href ? "text-red-500" : "text-white/40 group-hover:text-white"}`}>
                                {icon}
                              </div>
                              <span className={`text-2xl font-normal font-bebas tracking-widest uppercase transition-colors ${
                                pathname === href ? "text-red-500" : "text-white/70 group-hover:text-white"
                              }`}>
                                {label}
                              </span>
                            </div>
                            {isNew && (
                              <span className="bg-red-600 text-[9px] font-black px-2 py-0.5 rounded-full text-white animate-pulse">NOVO</span>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {/* Rodapé / Conta */}
                    <div className="bg-white/[0.02] border-t border-white/5 p-6 space-y-4">
                      {isAuthenticated ? (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="flex items-center gap-4 mb-6 px-2">
                            <div className="p-1 rounded-full border border-red-600/30">
                              <UserAvatar
                                profileImageUrl={profile?.profileImage?.url}
                                name={profile?.name}
                                size="sm"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-normal font-bebas tracking-wide text-white uppercase">
                                {user?.name?.split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-white/30 uppercase tracking-tighter">
                                {user?.email}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => { refreshProfile(); router.push("/perfil"); handleNavClick(); }}
                              variant="outline"
                              className="bg-white/5 border-white/10 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest rounded-xl h-11"
                            >
                              <User className="mr-2 h-3.5 w-3.5" /> Perfil
                            </Button>
                            <Button
                              onClick={() => { logout(); handleNavClick(); }}
                              variant="outline"
                              className="bg-red-600/10 border-red-600/20 hover:bg-red-600/20 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-xl h-11"
                            >
                              <LogOut className="mr-2 h-3.5 w-3.5" /> Sair
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="space-y-3"
                        >
                          <Button
                            onClick={() => { router.push("/login"); handleNavClick(); }}
                            className="w-full bg-white text-black hover:bg-white/90 text-sm font-black uppercase tracking-widest h-12 rounded-xl"
                          >
                            Entrar
                          </Button>
                          <Button
                            onClick={() => { router.push("/cadastro"); handleNavClick(); }}
                            variant="outline"
                            className="w-full bg-transparent border-white/10 hover:bg-white/5 text-sm font-black uppercase tracking-widest h-12 rounded-xl"
                          >
                            Criar Conta
                          </Button>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-center gap-6 pt-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        <Link href="/privacidade" onClick={handleNavClick}>Privacidade</Link>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <Link href="/termos" onClick={handleNavClick}>Termos</Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}


            {isAuthenticated ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-9 h-9 p-0 rounded-full overflow-hidden focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent hidden md:flex"
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
                className="rounded-full text-white/80 hover:bg-transparent hover:text-white hidden md:flex items-center justify-center gap-2 transition-colors duration-300 relative overflow-hidden"
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
