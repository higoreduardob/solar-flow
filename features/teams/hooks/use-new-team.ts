import { create } from 'zustand'

type NewTeamState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useNewTeam = create<NewTeamState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
