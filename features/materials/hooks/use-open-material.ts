import { create } from 'zustand'

type OpenMaterialState = {
  id?: string
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
}

export const useOpenMaterial = create<OpenMaterialState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}))
