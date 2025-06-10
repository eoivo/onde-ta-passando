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
} from "lucide-react";
import MediaCard from "@/components/MediaCard";
import {
  removeFromFavorites,
  removeFromWatchlist,
  removeFromWatched,
} from "@/services/auth-api";
import UserAvatar from "@/components/UserAvatar";

export default function ProfilePage() {
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    logout,
    updateProfile,
    uploadProfileImage,
    refreshProfile,
  } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      refreshProfile();
    }
  }, [isAuthenticated, profile, refreshProfile]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    refreshProfile();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);
    setIsUpdating(true);

    try {
      await updateProfile(name, email);
      setUpdateSuccess(true);
    } catch (err: any) {
      setUpdateError(err.message || "Erro ao atualizar perfil");
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
      await refreshProfile();
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
      await refreshProfile();
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
      await refreshProfile();
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
      await uploadProfileImage(imageFile);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
            Meu Perfil
          </h1>
          <Button
            variant="outline"
            onClick={logout}
            className="border-red-800 text-red-500 hover:bg-red-950 hover:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="p-2 mb-8">
            <TabsList className="w-full bg-transparent grid grid-cols-4 gap-1">
              <TabsTrigger
                value="profile"
                className="flex flex-col items-center py-3 rounded-md data-[state=active]:bg-red-900/20 data-[state=active]:text-red-500"
              >
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs">Perfil</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="flex flex-col items-center py-3 rounded-md data-[state=active]:bg-red-900/20 data-[state=active]:text-red-500"
              >
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="flex flex-col items-center py-3 rounded-md data-[state=active]:bg-red-900/20 data-[state=active]:text-red-500"
              >
                <EyeOff className="h-5 w-5 mb-1" />
                <span className="text-xs">Quero Ver</span>
              </TabsTrigger>
              <TabsTrigger
                value="watched"
                className="flex flex-col items-center py-3 rounded-md data-[state=active]:bg-red-900/20 data-[state=active]:text-red-500"
              >
                <Eye className="h-5 w-5 mb-1" />
                <span className="text-xs">Assistidos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="profile"
            className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800">
                  <div className="w-full h-full">
                    <UserAvatar
                      profileImageUrl={profile?.profileImage?.url}
                      name={profile?.name}
                      size="lg"
                      className="w-full h-full"
                    />
                  </div>
                  <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-gray-400 hover:text-white"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? "Enviando..." : "Alterar foto"}
                </Button>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-6">
                  Informações pessoais
                </h2>

                {updateError && (
                  <div className="mb-6 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="mb-6 p-3 bg-green-900/30 border border-green-800 text-green-200 rounded-lg text-sm">
                    Perfil atualizado com sucesso!
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-300"
                    >
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João Silva"
                      required
                      className="w-full bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Salvar alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="favorites"
            className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Meus favoritos</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {profile.favorites.movies.length === 0 &&
              profile.favorites.tvShows.length === 0 ? (
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
                <>
                  {profile.favorites.movies.map((movie) => (
                    <MediaCard
                      key={`movie-${movie.id}`}
                      item={movie}
                      type="movie"
                      collection="favorites"
                      onRemove={handleRemoveFromFavorites}
                    />
                  ))}
                  {profile.favorites.tvShows.map((show) => (
                    <MediaCard
                      key={`tv-${show.id}`}
                      item={show}
                      type="tv"
                      collection="favorites"
                      onRemove={handleRemoveFromFavorites}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="watchlist"
            className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Quero assistir</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {profile.watchlist.movies.length === 0 &&
              profile.watchlist.tvShows.length === 0 ? (
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
                <>
                  {profile.watchlist.movies.map((movie) => (
                    <MediaCard
                      key={`movie-${movie.id}`}
                      item={movie}
                      type="movie"
                      collection="watchlist"
                      onRemove={handleRemoveFromWatchlist}
                    />
                  ))}
                  {profile.watchlist.tvShows.map((show) => (
                    <MediaCard
                      key={`tv-${show.id}`}
                      item={show}
                      type="tv"
                      collection="watchlist"
                      onRemove={handleRemoveFromWatchlist}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="watched"
            className="bg-gray-900/80 rounded-xl p-6 border border-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Já assistidos</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {profile.watched.movies.length === 0 &&
              profile.watched.tvShows.length === 0 ? (
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
                <>
                  {profile.watched.movies.map((movie) => (
                    <MediaCard
                      key={`movie-${movie.id}`}
                      item={movie}
                      type="movie"
                      collection="watched"
                      onRemove={handleRemoveFromWatched}
                    />
                  ))}
                  {profile.watched.tvShows.map((show) => (
                    <MediaCard
                      key={`tv-${show.id}`}
                      item={show}
                      type="tv"
                      collection="watched"
                      onRemove={handleRemoveFromWatched}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
