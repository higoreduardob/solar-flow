import { create } from 'zustand'

type NewMeasureState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewMeasure = create<NewMeasureState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
