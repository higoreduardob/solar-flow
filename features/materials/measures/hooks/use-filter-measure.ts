import { create } from 'zustand'

type FilterMeasureState = {
  status?: string
  onChangeStatus: (status: string) => void
}

export const useFilterMeasure = create<FilterMeasureState>((set) => ({
  status: undefined,
  onChangeStatus: (status) => set({ status }),
}))
