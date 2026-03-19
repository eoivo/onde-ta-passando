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
  LogOut,
  User,
  Save,
  Film,
  Tv,
  Eye,
  EyeOff,
  Heart,
  Upload,
  Camera,
  Settings,
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
  updateUserProfile as updateAuthProfile,
  uploadProfileImage as apiUploadProfileImage,
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
    user,
    isLoading: authLoading,
    isAuthenticated,
    logout,
    updateProfile: updateAuthProfile,
    uploadProfileImage: apiUploadProfileImage,
    refreshProfile,
  } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [paginatedProfile, setPaginatedProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("favorites");
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
        setPaginatedProfile((prev: any) => prev ? { ...prev, favorites: res.data } : null);
        setFavCurrentPage(page);
        setFavTotalPages(res.pagination.totalPages);
        setFavTotal(res.pagination.totalItems);
      } else if (tab === "watchlist") {
        const res = await apiGetWatchlist(page, 20);
        setPaginatedProfile((prev: any) => prev ? { ...prev, watchlist: res.data } : null);
        setWatchCurrentPage(page);
        setWatchTotalPages(res.pagination.totalPages);
        setWatchTotal(res.pagination.totalItems);
      } else if (tab === "watched") {
        const res = await apiGetWatched(page, 20);
        setPaginatedProfile((prev: any) => prev ? { ...prev, watched: res.data } : null);
        setWatchedCurrentPage(page);
        setWatchedTotalPages(res.pagination.totalPages);
        setWatchedTotal(res.pagination.totalItems);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${tab}:`, error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // When tab changes, fetch content for the current page of that tab
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
  };  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      await updateAuthProfile(name, email);
      
      // Se a seção de senha estiver aberta e preenchida, tentamos atualizar a senha
      if (showPasswordFields && currentPassword && newPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error("As novas senhas não coincidem");
        }
        await changePassword(currentPassword, newPassword);
        
        // Limpar campos de senha após sucesso
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowPasswordFields(false);
        setIsModalOpen(false); // Fecha o modal apenas em caso de sucesso total
      } else if (!showPasswordFields) {
        setIsModalOpen(false); // Fecha o modal se atualizou apenas nome/email
      }

      setUpdateSuccess(true);
      toast.success("Perfil atualizado com sucesso!");
      fetchProfile(); // Refresh profile data after update
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao atualizar perfil";
      setUpdateError(errorMessage);
      
      // Limpar campos de senha em caso de erro para segurança/UX
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
      await fetchTabContent("favorites", favCurrentPage); // Refresh only the current tab
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
      await fetchTabContent("watchlist", watchCurrentPage); // Refresh only the current tab
      toast.success(
        `${type === "movie" ? "Filme" : "Série"} removido da lista de interesse`
      );
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item da lista de interesse");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveFromWatched = async (id: string, type: "movie" | "tv") => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      await removeFromWatched(type, id);
      await fetchTabContent("watched", watchedCurrentPage); // Refresh only the current tab
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

    // Validar tamanho (max 2MB)
    if (imageFile.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 2MB");
      return;
    }

    // Validar tipo
    if (!imageFile.type.startsWith("image/")) {
      toast.error("Por favor, envie apenas imagens");
      return;
    }

    try {
      setIsUploading(true);
      await apiUploadProfileImage(imageFile);
      toast.success("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar foto de perfil");
    } finally {
      setIsUploading(false);
      // Limpar o input
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

  if (isDataLoading || authLoading) { // Combined loading states
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !paginatedProfile) { // Use paginatedProfile here
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
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
          {/* Avatar com Ring */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-red-600 p-1 bg-black shadow-2xl relative overflow-hidden">
              <UserAvatar
                profileImageUrl={paginatedProfile?.profileImage?.url}
                name={paginatedProfile?.name}
                size="lg"
                className="w-full h-full rounded-full object-cover"
              />
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={triggerFileInput}
              >
                <Camera className="w-8 h-8 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              )}
            </div>
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
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:border-red-600/30 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Editar Perfil</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        {updateError && (
                          <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
                            {updateError}
                          </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                          <div className="space-y-1.5">
                            <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-white/30">
                              Nome completo
                            </label>
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Nome completo"
                              required
                              className="w-full bg-white/5 border-white/10 text-white rounded-xl focus:border-red-600/50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-white/30">
                              Email de acesso
                            </label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email de acesso"
                              required
                              className="w-full bg-white/5 border-white/10 text-white rounded-xl focus:border-red-600/50"
                            />
                          </div>

                          <div className="pt-2 flex flex-col gap-3">
                            <hr className="border-white/5 my-1" />
                            
                            <button
                              type="button"
                              onClick={() => setShowPasswordFields(!showPasswordFields)}
                              className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors py-1 group w-fit"
                            >
                              <div className={`w-5 h-5 rounded-full border border-red-500/50 flex items-center justify-center text-xs font-bold transition-transform duration-300 ${showPasswordFields ? 'rotate-45' : ''}`}>
                                <span className="mb-0.5">+</span>
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest tracking-wide">Alterar Senha</span>
                            </button>

                            {showPasswordFields && (
                              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Senha Atual</label>
                                  <div className="relative group/input">
                                    <Input 
                                      type={showCurrentPassword ? "text" : "password"} 
                                      value={currentPassword}
                                      onChange={(e) => setCurrentPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-red-600/50 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                                    >
                                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Nova Senha</label>
                                  <div className="relative group/input">
                                    <Input 
                                      type={showNewPassword ? "text" : "password"} 
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-red-600/50 pr-10"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                                    >
                                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-white/20 font-medium italic">Mínimo 8 caracteres, maiúsculas e números</p>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Confirmar Nova Senha</label>
                                  <div className="relative group/input">
                                    <Input 
                                      type={showConfirmPassword ? "text" : "password"} 
                                      value={confirmNewPassword}
                                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                                      placeholder="••••••••" 
                                      className={`w-full bg-white/5 border-white/10 text-white rounded-xl focus:border-red-600/50 pr-10 ${
                                        confirmNewPassword && (newPassword === confirmNewPassword ? "border-green-500/50" : "border-red-500/50")
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                                    >
                                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  {confirmNewPassword && (
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${newPassword === confirmNewPassword ? "text-green-500" : "text-red-500"}`}>
                                      {newPassword === confirmNewPassword ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest h-12 rounded-xl mt-4 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Salvar Alterações"
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-white/40 font-medium text-sm md:text-base">
                  {paginatedProfile.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 text-center backdrop-blur-sm group hover:border-red-600/30 transition-all duration-300">
            <div className="text-2xl md:text-4xl font-black text-red-500 mb-1">
              {favTotal}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Favoritos</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 text-center backdrop-blur-sm group hover:border-red-600/30 transition-all duration-300">
            <div className="text-2xl md:text-4xl font-black text-white mb-1">
              {watchTotal}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Quero Ver</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 text-center backdrop-blur-sm group hover:border-red-600/30 transition-all duration-300">
            <div className="text-2xl md:text-4xl font-black text-white mb-1">
              {watchedTotal}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Assistidos</div>
          </div>
        </div>



        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="mb-10">
            <TabsList className="w-full bg-transparent p-0 h-auto grid grid-cols-1 md:grid-cols-3 gap-2">
              <TabsTrigger
                value="favorites"
                className="flex items-center justify-center gap-3 py-4 rounded-xl border border-transparent transition-all duration-200 text-white/40 data-[state=active]:bg-red-600/10 data-[state=active]:border-red-600/30 data-[state=active]:text-red-500 hover:text-white/60"
              >
                <Heart className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="flex items-center justify-center gap-3 py-4 rounded-xl border border-transparent transition-all duration-200 text-white/40 data-[state=active]:bg-red-600/10 data-[state=active]:border-red-600/30 data-[state=active]:text-red-500 hover:text-white/60"
              >
                <EyeOff className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Quero Ver</span>
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="flex items-center justify-center gap-3 py-4 rounded-xl border border-transparent transition-all duration-200 text-white/40 data-[state=active]:bg-red-600/10 data-[state=active]:border-red-600/30 data-[state=active]:text-red-500 hover:text-white/60"
              >
                <Eye className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Assistidos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="favorites"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {paginatedProfile.favorites.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400">
                    Nenhum favorito ainda
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Adicione filmes e séries aos seus favoritos
                  </p>
                </div>
              ) : (
                paginatedProfile.favorites.map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="favorites"
                    onRemove={async (id, type) => {
                      await handleRemoveFromFavorites(id, type);
                      fetchTabContent("favorites", favCurrentPage);
                    }}
                  />
                ))
              )}
            </div>
            
            {favTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4 pb-10">
                <Button 
                  variant="outline" 
                  disabled={favCurrentPage === 1}
                  onClick={() => handlePageChange("favorites", favCurrentPage - 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Anterior
                </Button>
                <div className="text-white/20 text-xs font-black uppercase tracking-widest">
                  Página <span className="text-red-500">{favCurrentPage}</span> de {favTotalPages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={favCurrentPage === favTotalPages}
                  onClick={() => handlePageChange("favorites", favCurrentPage + 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="watchlist"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {paginatedProfile.watchlist.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <EyeOff className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400">
                    Lista vazia
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Adicione filmes e séries para assistir mais tarde
                  </p>
                </div>
              ) : (
                paginatedProfile.watchlist.map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="watchlist"
                    onRemove={async (id, type) => {
                      await handleRemoveFromWatchlist(id, type);
                      fetchTabContent("watchlist", watchCurrentPage);
                    }}
                  />
                ))
              )}
            </div>

            {watchTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4 pb-10">
                <Button 
                  variant="outline" 
                  disabled={watchCurrentPage === 1}
                  onClick={() => handlePageChange("watchlist", watchCurrentPage - 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Anterior
                </Button>
                <div className="text-white/20 text-xs font-black uppercase tracking-widest">
                  Página <span className="text-red-500">{watchCurrentPage}</span> de {watchTotalPages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={watchCurrentPage === watchTotalPages}
                  onClick={() => handlePageChange("watchlist", watchCurrentPage + 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="watched"
            className="bg-transparent focus-visible:outline-none"
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {paginatedProfile.watched.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400">
                    Nenhum título assistido
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Marque filmes e séries que você já assistiu
                  </p>
                </div>
              ) : (
                paginatedProfile.watched.map((item: any) => (
                  <MediaCard
                    key={`${item.mediaType}-${item.id}`}
                    item={item}
                    type={item.mediaType}
                    collection="watched"
                    onRemove={async (id, type) => {
                      await handleRemoveFromWatched(id, type);
                      fetchTabContent("watched", watchedCurrentPage);
                    }}
                  />
                ))
              )}
            </div>

            {watchedTotalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4 pb-10">
                <Button 
                  variant="outline" 
                  disabled={watchedCurrentPage === 1}
                  onClick={() => handlePageChange("watched", watchedCurrentPage - 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Anterior
                </Button>
                <div className="text-white/20 text-xs font-black uppercase tracking-widest">
                  Página <span className="text-red-500">{watchedCurrentPage}</span> de {watchedTotalPages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={watchedCurrentPage === watchedTotalPages}
                  onClick={() => handlePageChange("watched", watchedCurrentPage + 1)}
                  className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl px-6"
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
