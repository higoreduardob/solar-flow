import { create } from 'zustand'

type NewNewSignUpState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewNewSignUp = create<NewNewSignUpState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
