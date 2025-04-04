import { create } from 'zustand'

type OpenCategoryState = {
  id?: string
  isOpen: boolean
  onOpen: (id: string) => void
  onClose: () => void
}

export const useOpenCategory = create<OpenCategoryState>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string) => set({ isOpen: true, id }),
  onClose: () => set({ isOpen: false, id: undefined }),
}))

type OpenCategoryDataState = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useOpenCategoryData = create<OpenCategoryDataState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
