import { create } from 'zustand'

type OpenTeamState = {
  id?: string
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
}

export const useOpenTeam = create<OpenTeamState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}))

type OpenTeamDataState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useOpenTeamData = create<OpenTeamDataState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
