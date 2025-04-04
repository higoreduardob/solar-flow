import { create } from 'zustand'

type FilterMaterialState = {
  status?: string
  onChangeStatus: (status: string) => void
}

export const useFilterMaterial = create<FilterMaterialState>((set) => ({
  status: undefined,
  onChangeStatus: (status) => set({ status }),
}))
