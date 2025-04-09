import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterMeasureState = {
  status: string
  onChangeStatus: (status: string) => void
}

export const useFilterMeasure = create<FilterMeasureState>((set) => ({
  status: FilterStatus[0].value,
  onChangeStatus: (status) => set({ status }),
}))
