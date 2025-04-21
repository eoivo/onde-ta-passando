import { create } from "zustand"

interface LoadingState {
  isLoading: boolean
  title: string | null
  setLoading: (isLoading: boolean, title?: string | null) => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  title: null,
  setLoading: (isLoading, title = null) => set({ isLoading, title }),
}))
