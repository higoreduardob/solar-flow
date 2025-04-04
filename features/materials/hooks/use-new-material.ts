import { create } from 'zustand'

type NewMaterialState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewMaterial = create<NewMaterialState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
