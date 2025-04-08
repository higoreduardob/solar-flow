import { create } from 'zustand'

type NewWorkMaterialState = {
  workId?: string
  isOpen: boolean
  onOpen: (workId: string) => void
  onClose: () => void
}

export const useNewWorkMaterial = create<NewWorkMaterialState>((set) => ({
  workId: undefined,
  isOpen: false,
  onOpen: (workId: string) => set({ workId, isOpen: true }),
  onClose: () => set({ workId: undefined, isOpen: false }),
}))
