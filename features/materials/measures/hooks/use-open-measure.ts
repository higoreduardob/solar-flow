import { create } from 'zustand'

type OpenMeasureState = {
  id?: string
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
}

export const useOpenMeasure = create<OpenMeasureState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}))

type OpenMeasureDataState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useOpenMeasureData = create<OpenMeasureDataState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
