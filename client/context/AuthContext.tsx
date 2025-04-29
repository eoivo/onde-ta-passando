"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authService from "@/services/auth-api";
import { UserData, ProfileData, AuthResponse } from "@/services/auth-api";

interface AuthContextType {
  user: UserData | null;
  profile: ProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (name?: string, email?: string) => Promise<void>;
  uploadProfileImage: (imageFile: File) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const userProfile = await authService.getCurrentUser();
          setProfile(userProfile);
          setUser({
            id: userProfile._id,
            name: userProfile.name,
            email: userProfile.email,
          });
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginUser(email, password);
      setUser(response.user);

      const userProfile = await authService.getCurrentUser();
      setProfile(userProfile);

      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.registerUser(name, email, password);

      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logoutUser();
    setUser(null);
    setProfile(null);
    router.push("/");
  };

  const updateProfile = async (name?: string, email?: string) => {
    try {
      setIsLoading(true);
      const updatedProfile = await authService.updateUserProfile(name, email);
      setProfile(updatedProfile);
      if (user) {
        setUser({
          ...user,
          name: updatedProfile.name,
          email: updatedProfile.email,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfileImage = async (imageFile: File) => {
    try {
      setIsLoading(true);
      const updatedProfile = await authService.uploadProfileImage(imageFile);
      setProfile(updatedProfile);
      if (user) {
        setUser({
          ...user,
          name: updatedProfile.name,
          email: updatedProfile.email,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      const userProfile = await authService.getCurrentUser();

      const profileString = JSON.stringify(profile);
      const newProfileString = JSON.stringify(userProfile);

      if (profileString !== newProfileString) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
