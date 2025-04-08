import { create } from 'zustand'

type OpenWorkMaterialState = {
  id?: string
  workId?: string
  isOpen: boolean
  onOpen: (id: string, workId: string) => void
  onClose: () => void
}

export const useOpenWorkMaterial = create<OpenWorkMaterialState>((set) => ({
  id: undefined,
  workId: undefined,
  isOpen: false,
  onOpen: (id: string, workId: string) => set({ id, workId, isOpen: true }),
  onClose: () => set({ id: undefined, workId: undefined, isOpen: false }),
}))
