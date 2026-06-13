import { create } from 'zustand'

interface AppState {
  // Ajouter tes slices ici
}

export const useAppStore = create<AppState>()(() => ({
  // état initial
}))
