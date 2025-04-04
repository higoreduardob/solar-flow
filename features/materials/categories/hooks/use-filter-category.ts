import { create } from 'zustand'

type FilterCategoryState = {
  status?: string
  onChangeStatus: (status: string) => void
}

export const useFilterCategory = create<FilterCategoryState>((set) => ({
  status: undefined,
  onChangeStatus: (status) => set({ status }),
}))
