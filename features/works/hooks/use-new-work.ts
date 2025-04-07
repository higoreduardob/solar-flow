import { create } from 'zustand'

type NewWorkState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewWork = create<NewWorkState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
