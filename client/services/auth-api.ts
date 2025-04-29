export interface UserData {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserData;
}

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  profileImage?: {
    public_id: string;
    url: string;
  };
  favorites: {
    movies: FavoriteMovie[];
    tvShows: FavoriteTvShow[];
  };
  watchlist: {
    movies: FavoriteMovie[];
    tvShows: FavoriteTvShow[];
  };
  watched: {
    movies: FavoriteMovie[];
    tvShows: FavoriteTvShow[];
  };
  createdAt: string;
}

export interface FavoriteMovie {
  id: string;
  title: string;
  poster_path: string;
  addedAt: string;
}

export interface FavoriteTvShow {
  id: string;
  name: string;
  poster_path: string;
  addedAt: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ocorreu um erro na requisição");
  }

  return data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const data = await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const data = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return data;
};

export const logoutUser = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

export const getCurrentUser = async (): Promise<ProfileData> => {
  try {
    const data = await authFetch("/auth/me");
    return data.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (
  name?: string,
  email?: string
): Promise<ProfileData> => {
  const updateData: Record<string, string> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  const data = await authFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(updateData),
  });

  return data.data;
};

export const addToFavorites = async (
  id: string,
  title: string | undefined,
  name: string | undefined,
  poster_path: string,
  mediaType: "movie" | "tv"
) => {
  const data = await authFetch("/users/favorites", {
    method: "POST",
    body: JSON.stringify({
      id,
      title,
      name,
      poster_path,
      mediaType,
    }),
  });

  return data.data;
};

export const removeFromFavorites = async (
  mediaType: "movie" | "tv",
  id: string
) => {
  const data = await authFetch(`/users/favorites/${mediaType}/${id}`, {
    method: "DELETE",
  });

  return data.data;
};

export const getFavorites = async () => {
  const data = await authFetch("/users/favorites");
  return data.data;
};

export const addToWatchlist = async (
  id: string,
  title: string | undefined,
  name: string | undefined,
  poster_path: string,
  mediaType: "movie" | "tv"
) => {
  const data = await authFetch("/users/watchlist", {
    method: "POST",
    body: JSON.stringify({
      id,
      title,
      name,
      poster_path,
      mediaType,
    }),
  });

  return data.data;
};

export const removeFromWatchlist = async (
  mediaType: "movie" | "tv",
  id: string
) => {
  const data = await authFetch(`/users/watchlist/${mediaType}/${id}`, {
    method: "DELETE",
  });

  return data.data;
};

export const getWatchlist = async () => {
  const data = await authFetch("/users/watchlist");
  return data.data;
};

export const addToWatched = async (
  id: string,
  title: string | undefined,
  name: string | undefined,
  poster_path: string,
  mediaType: "movie" | "tv"
) => {
  const data = await authFetch("/users/watched", {
    method: "POST",
    body: JSON.stringify({
      id,
      title,
      name,
      poster_path,
      mediaType,
    }),
  });

  return data.data;
};

export const removeFromWatched = async (
  mediaType: "movie" | "tv",
  id: string
) => {
  const data = await authFetch(`/users/watched/${mediaType}/${id}`, {
    method: "DELETE",
  });

  return data.data;
};

export const getWatched = async () => {
  const data = await authFetch("/users/watched");
  return data.data;
};

export const uploadProfileImage = async (
  imageFile: File
): Promise<ProfileData> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao enviar imagem de perfil");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
};
