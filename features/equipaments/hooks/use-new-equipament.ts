import { create } from 'zustand'

type NewEquipamentState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewEquipament = create<NewEquipamentState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
