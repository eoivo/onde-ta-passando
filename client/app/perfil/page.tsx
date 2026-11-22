"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Film,
  Tv,
  Eye,
  EyeOff,
  Heart,
  Clock,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import MediaCard from "@/components/MediaCard";
import {
  getFavorites as apiGetFavorites,
  getWatchlist as apiGetWatchlist,
  getWatched as apiGetWatched,
  removeFromFavorites,
  removeFromWatchlist,
  removeFromWatched,
  changePassword,
  getCurrentUser as getProfile,
} from "@/services/auth-api";
import UserAvatar from "@/components/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    updateProfile: updateAuthProfile,
    uploadProfileImage: apiUploadProfileImage,
  } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [paginatedProfile, setPaginatedProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("favorites");
  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Estados de Paginação
  const [favCurrentPage, setFavCurrentPage] = useState(1);
  const [favTotalPages, setFavTotalPages] = useState(1);
  const [favTotal, setFavTotal] = useState(0);
  
  const [watchCurrentPage, setWatchCurrentPage] = useState(1);
  const [watchTotalPages, setWatchTotalPages] = useState(1);
  const [watchTotal, setWatchTotal] = useState(0);

  const [watchedCurrentPage, setWatchedCurrentPage] = useState(1);
  const [watchedTotalPages, setWatchedTotalPages] = useState(1);
  const [watchedTotal, setWatchedTotal] = useState(0);

  const [isRemoving, setIsRemoving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (paginatedProfile) {
      setName(paginatedProfile.name);
      setEmail(paginatedProfile.email);
    }
  }, [paginatedProfile]);

  // Initial fetch of profile data and first page of each tab
  useEffect(() => {
    if (isAuthenticated && !paginatedProfile) {
      fetchProfile();
    }
  }, [isAuthenticated, paginatedProfile]);

  const fetchProfile = async () => {
    try {
      setIsDataLoading(true);
      const userData = await getProfile();
      
      const favs = await apiGetFavorites(1, 20);
      const watch = await apiGetWatchlist(1, 20);
      const wat = await apiGetWatched(1, 20);

      setPaginatedProfile({
        ...userData,
        favorites: favs.data,
        watchlist: watch.data,
        watched: wat.data
      });

      setFavTotalPages(favs.pagination?.totalPages || 1);
      setFavTotal(favs.pagination?.totalItems || 0);

      setWatchTotalPages(watch.pagination?.totalPages || 1);
      setWatchTotal(watch.pagination?.totalItems || 0);

      setWatchedTotalPages(wat.pagination?.totalPages || 1);
      setWatchedTotal(wat.pagination?.totalItems || 0);
      
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchTabContent = async (tab: string, page: number) => {
    try {
      if (tab === "favorites") {
        const res = await apiGetFavorites(page, 20);
        if (res.data.length === 0 && page > 1) {
          return fetchTabContent("favorites", page - 1);
        }
        setPaginatedProfile((prev: any) => prev ? { ...prev, favorites: res.data } : null);
        setFavCurrentPage(page);
        setFavTotalPages(res.pagination.totalPages || 1);
        setFavTotal(res.pagination.totalItems || 0);
      } else if (tab === "watchlist") {
        const res = await apiGetWatchlist(page, 20);
        if (res.data.length === 0 && page > 1) {
          return fetchTabContent("watchlist", page - 1);
        }
        setPaginatedProfile((prev: any) => prev ? { ...prev, watchlist: res.data } : null);
        setWatchCurrentPage(page);
        setWatchTotalPages(res.pagination.totalPages || 1);
        setWatchTotal(res.pagination.totalItems || 0);
      } else if (tab === "watched") {
        const res = await apiGetWatched(page, 20);
        if (res.data.length === 0 && page > 1) {
          return fetchTabContent("watched", page - 1);
        }
        setPaginatedProfile((prev: any) => prev ? { ...prev, watched: res.data } : null);
        setWatchedCurrentPage(page);
        setWatchedTotalPages(res.pagination.totalPages || 1);
        setWatchedTotal(res.pagination.totalItems || 0);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${tab}:`, error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "favorites") fetchTabContent("favorites", favCurrentPage);
    if (value === "watchlist") fetchTabContent("watchlist", watchCurrentPage);
    if (value === "watched") fetchTabContent("watched", watchedCurrentPage);
  };

  const handlePageChange = (tab: string, newPage: number) => {
    if (tab === "favorites") {
      setFavCurrentPage(newPage);
      fetchTabContent("favorites", newPage);
    } else if (tab === "watchlist") {
      setWatchCurrentPage(newPage);
      fetchTabContent("watchlist", newPage);
    } else if (tab === "watched") {
      setWatchedCurrentPage(newPage);
      fetchTabContent("watched", newPage);
    }
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      await updateAuthProfile(name, email);
      
      if (showPasswordFields && currentPassword && newPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error("As novas senhas não coincidem");
        }
        await changePassword(currentPassword, newPassword);
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowPasswordFields(false);
        setIsModalOpen(false);
      } else if (!showPasswordFields) {
        setIsModalOpen(false);
      }

      setUpdateSuccess(true);
      toast.success("Perfil atualizado com sucesso!");
      fetchProfile();
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao atualizar perfil";
      setUpdateError(errorMessage);
      
      if (showPasswordFields) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
      
      console.error("Erro ao atualizar perfil:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFromFavorites = async (
    id: string,
    type: "movie" | "tv"
  ) => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await removeFromFavorites(type, id);
      await fetchTabContent("favorites", favCurrentPage);
      toast.success(
        `${type === "movie" ? "Filme" : "Série"} removido dos favoritos`
      );
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item dos favoritos");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveFromWatchlist = async (
    id: string,
    type: "movie" | "tv"
  ) => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await removeFromWatchlist(type, id);
      await fetchTabContent("watchlist", watchCurrentPage);
      toast.success(
        `${type === "movie" ? "Filme" : "Série"} removido da lista Quero Ver`
      );
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item da lista Quero Ver");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveFromWatched = async (id: string, type: "movie" | "tv") => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await removeFromWatched(type, id);
      await fetchTabContent("watched", watchedCurrentPage);
      toast.success(
        `${
          type === "movie" ? "Filme" : "Série"
        } removido da lista de assistidos`
      );
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item da lista de assistidos");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFile = files[0];

    if (imageFile.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 2MB");
      return;
    }

    if (!imageFile.type.startsWith("image/")) {
      toast.error("Por favor, envie apenas imagens");
      return;
    }

    try {
      setIsUploading(true);
      await apiUploadProfileImage(imageFile);
      toast.success("Foto de perfil atualizada com sucesso!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar foto de perfil");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filterMediaItems = (items: any[]) => {
    if (mediaFilter === "all") return items;
    return items.filter((item) => item.mediaType === mediaFilter);
  };

  if (isDataLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !paginatedProfile) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Banner de Perfil */}
      <div className="relative h-32 md:h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0808] via-[#2a0d0d] to-black" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, #e8374a 0px, #e8374a 1px, transparent 1px, transparent 20px)' 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 mb-8 md:mb-10">
          {/* Avatar com Ring e Badge de Câmera visível no mobile/desktop */}
          <div className="relative group">
            <div
              onClick={triggerFileInput}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-red-600 p-1 bg-black shadow-2xl relative overflow-hidden cursor-pointer"
            >
              <UserAvatar
                profileImageUrl={paginatedProfile?.profileImage?.url}
                name={paginatedProfile?.name}
                size="lg"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              title="Alterar foto de perfil"
              aria-label="Alterar foto de perfil"
              className="md:hidden absolute bottom-1 right-1 w-9 h-9 rounded-full bg-neutral-900/95 hover:bg-red-600 border border-white/15 hover:border-red-500 text-neutral-300 hover:text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer z-20"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center md:text-left flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h1 className="font-bebas text-4xl md:text-5xl text-white tracking-wider uppercase drop-shadow-lg leading-none">
                    {paginatedProfile.name}
                  </h1>
                  
                  {/* Modal de Configurações */}
                  <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) {
                      setUpdateError("");
                      setUpdateSuccess(false);
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        title="Editar perfil"
                        aria-label="Editar perfil"
                        className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.12] hover:border-white/25 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0d0d10]/95 backdrop-blur-2xl border border-white/10 text-white rounded-3xl sm:max-w-[440px] p-6 md:p-7 shadow-2xl">
                      <DialogHeader className="text-left space-y-1">
                        <DialogTitle className="font-bebas text-3xl tracking-wider uppercase text-white">
                          Editar Perfil
                        </DialogTitle>
                        <p className="text-xs text-neutral-400">
                          Atualize suas informações pessoais ou altere sua senha de acesso.
                        </p>
                      </DialogHeader>
                      
                      <div className="space-y-5 pt-2">
                        {updateError && (
                          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 rounded-xl text-xs font-medium">
                            {updateError}
                          </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-semibold text-neutral-300 block">
                              Nome completo
                            </label>
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Seu nome"
                              required
                              className="w-full h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:border-red-500/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-semibold text-neutral-300 block">
                              E-mail de acesso
                            </label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu@email.com"
                              required
                              className="w-full h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:border-red-500/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>

                          <div className="pt-2 flex flex-col gap-3">
                            <hr className="border-white/10 my-1" />
                            
                            <button
                              type="button"
                              onClick={() => setShowPasswordFields(!showPasswordFields)}
                              className="flex items-center gap-2.5 text-red-400 hover:text-red-300 transition-colors py-1 group w-fit cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center transition-transform duration-300 ${showPasswordFields ? 'rotate-45' : ''}`}>
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </div>
                              <span className="text-xs font-semibold leading-none">Alterar senha</span>
                            </button>

                            {showPasswordFields && (
                              <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-neutral-300 block">Senha atual</label>
                                  <div className="relative">
                                    <Input 
                                      type={showCurrentPassword ? "text" : "password"} 
                                      value={currentPassword}
                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:border-red-500/60 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                                    >
                                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-neutral-300 block">Nova senha</label>
                                  <div className="relative">
                                    <Input 
                                      type={showNewPassword ? "text" : "password"} 
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className="h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:border-red-500/60 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                                    >
                                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-neutral-500">Mínimo 8 caracteres, maiúsculas e números</p>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-neutral-300 block">Confirmar nova senha</label>
                                  <div className="relative">
                                    <Input 
                                      type={showConfirmPassword ? "text" : "password"} 
                                      value={confirmNewPassword}
                                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className={`w-full h-11 bg-white/[0.04] border-white/10 text-white rounded-xl focus:border-red-500/60 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 ${
                                        confirmNewPassword && (newPassword === confirmNewPassword ? "border-green-500/50" : "border-red-500/50")
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                                    >
                                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  {confirmNewPassword && (
                                    <p className={`text-[11px] font-semibold ${newPassword === confirmNewPassword ? "text-green-400" : "text-red-400"}`}>
                                      {newPassword === confirmNewPassword ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm h-11 rounded-xl mt-3 shadow-lg shadow-red-600/20 transition-colors cursor-pointer"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Salvar alterações"
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-neutral-400 font-medium text-sm mt-1">
                  {paginatedProfile.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Interativas (Clicáveis para alternar a aba ativa) */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8">
          <button
            type="button"
            onClick={() => handleTabChange("favorites")}
            className={`rounded-2xl p-4 md:p-5 text-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              activeTab === "favorites"
                ? "bg-red-600/[0.08] border-red-500/40 shadow-lg shadow-red-950/20"
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            }`}
          >
            <div className={`text-2xl md:text-4xl font-black mb-1 transition-colors ${
              activeTab === "favorites" ? "text-red-500" : "text-white"
            }`}>
              {favTotal}
            </div>
            <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "favorites" ? "text-red-300" : "text-neutral-400"
            }`}>
              Favoritos
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("watchlist")}
            className={`rounded-2xl p-4 md:p-5 text-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              activeTab === "watchlist"
                ? "bg-red-600/[0.08] border-red-500/40 shadow-lg shadow-red-950/20"
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            }`}
          >
            <div className={`text-2xl md:text-4xl font-black mb-1 transition-colors ${
              activeTab === "watchlist" ? "text-red-500" : "text-white"
            }`}>
              {watchTotal}
            </div>
            <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "watchlist" ? "text-red-300" : "text-neutral-400"
            }`}>
              Quero Ver
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("watched")}
            className={`rounded-2xl p-4 md:p-5 text-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
              activeTab === "watched"
                ? "bg-red-600/[0.08] border-red-500/40 shadow-lg shadow-red-950/20"
                : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            }`}
          >
            <div className={`text-2xl md:text-4xl font-black mb-1 transition-colors ${
              activeTab === "watched" ? "text-red-500" : "text-white"
            }`}>
              {watchedTotal}
            </div>
            <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === "watched" ? "text-red-300" : "text-neutral-400"
            }`}>
              Assistidos
            </div>
          </button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Barra de Abas Horizontal (3 colunas no mobile e desktop) + Filtro Todos/Filmes/Séries */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8 pb-4 border-b border-white/10">
            <TabsList className="w-full md:w-auto bg-white/[0.03] border border-white/10 p-1 rounded-full h-auto grid grid-cols-3 gap-1">
              <TabsTrigger
                value="favorites"
                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 h-9 rounded-full border border-transparent transition-all duration-200 text-neutral-400 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:text-white cursor-pointer"
              >
                <Heart className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider leading-none">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 h-9 rounded-full border border-transparent transition-all duration-200 text-neutral-400 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:text-white cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider leading-none">Quero Ver</span>
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 h-9 rounded-full border border-transparent transition-all duration-200 text-neutral-400 data-[state=active]:bg-red-600 data-[state=active]:text-white hover:text-white cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider leading-none">Assistidos</span>
              </TabsTrigger>
            </TabsList>

            {/* Filtro rápido por tipo de obra */}
            <div className="flex items-center justify-center md:justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setMediaFilter("all")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  mediaFilter === "all"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter("movie")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  mediaFilter === "movie"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Filmes
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter("tv")}
                className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer leading-none ${
                  mediaFilter === "tv"
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                Séries
              </button>
            </div>
          </div>

          <TabsContent
            value="favorites"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filterMediaItems(paginatedProfile.favorites).length === 0 ? (
                <div className="col-span-full bg-white/[0.02] border border-white/10 rounded-3xl text-center py-14 px-4">
                  <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-neutral-300">
                    {mediaFilter === "all"
                      ? "Nenhum favorito ainda"
                      : `Nenhum ${mediaFilter === "movie" ? "filme" : "série"} nos favoritos`}
                  </h3>
                  <p className="text-neutral-500 text-xs mt-1">
                    Adicione filmes e séries aos seus favoritos para acessá-los rapidamente.
                  </p>
                </div>
              ) : (
                filterMediaItems(paginatedProfile.favorites).map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="favorites"
                    onRemove={async (id, type) => {
                      await handleRemoveFromFavorites(id, type);
                    }}
                  />
                ))
              )}
            </div>
            
            {favTotalPages > 1 && (
              <div className="flex justify-center items-center mt-10 pt-8 border-t border-white/5 gap-3">
                <button
                  type="button"
                  disabled={favCurrentPage === 1}
                  onClick={() => handlePageChange("favorites", favCurrentPage - 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <span className="text-white font-bold">{favCurrentPage}</span>
                  <span>/</span>
                  <span>{favTotalPages}</span>
                </div>
                <button
                  type="button"
                  disabled={favCurrentPage === favTotalPages}
                  onClick={() => handlePageChange("favorites", favCurrentPage + 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="watchlist"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filterMediaItems(paginatedProfile.watchlist).length === 0 ? (
                <div className="col-span-full bg-white/[0.02] border border-white/10 rounded-3xl text-center py-14 px-4">
                  <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-neutral-300">
                    {mediaFilter === "all"
                      ? "Sua lista Quero Ver está vazia"
                      : `Nenhum ${mediaFilter === "movie" ? "filme" : "série"} na lista Quero Ver`}
                  </h3>
                  <p className="text-neutral-500 text-xs mt-1">
                    Salve filmes e séries para assistir mais tarde.
                  </p>
                </div>
              ) : (
                filterMediaItems(paginatedProfile.watchlist).map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="watchlist"
                    onRemove={async (id, type) => {
                      await handleRemoveFromWatchlist(id, type);
                    }}
                  />
                ))
              )}
            </div>

            {watchTotalPages > 1 && (
              <div className="flex justify-center items-center mt-10 pt-8 border-t border-white/5 gap-3">
                <button
                  type="button"
                  disabled={watchCurrentPage === 1}
                  onClick={() => handlePageChange("watchlist", watchCurrentPage - 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <span className="text-white font-bold">{watchCurrentPage}</span>
                  <span>/</span>
                  <span>{watchTotalPages}</span>
                </div>
                <button
                  type="button"
                  disabled={watchCurrentPage === watchTotalPages}
                  onClick={() => handlePageChange("watchlist", watchCurrentPage + 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="watched"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filterMediaItems(paginatedProfile.watched).length === 0 ? (
                <div className="col-span-full bg-white/[0.02] border border-white/10 rounded-3xl text-center py-14 px-4">
                  <Eye className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-neutral-300">
                    {mediaFilter === "all"
                      ? "Nenhum título assistido"
                      : `Nenhum ${mediaFilter === "movie" ? "filme" : "série"} marcado como assistido`}
                  </h3>
                  <p className="text-neutral-500 text-xs mt-1">
                    Marque os filmes e séries que você já assistiu para manter seu histórico.
                  </p>
                </div>
              ) : (
                filterMediaItems(paginatedProfile.watched).map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="watched"
                    onRemove={async (id, type) => {
                      await handleRemoveFromWatched(id, type);
                    }}
                  />
                ))
              )}
            </div>

            {watchedTotalPages > 1 && (
              <div className="flex justify-center items-center mt-10 pt-8 border-t border-white/5 gap-3">
                <button
                  type="button"
                  disabled={watchedCurrentPage === 1}
                  onClick={() => handlePageChange("watched", watchedCurrentPage - 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <div className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <span className="text-white font-bold">{watchedCurrentPage}</span>
                  <span>/</span>
                  <span>{watchedTotalPages}</span>
                </div>
                <button
                  type="button"
                  disabled={watchedCurrentPage === watchedTotalPages}
                  onClick={() => handlePageChange("watched", watchedCurrentPage + 1)}
                  className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
