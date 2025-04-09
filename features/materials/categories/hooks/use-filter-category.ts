import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterCategoryState = {
  status: string
  onChangeStatus: (status: string) => void
}

export const useFilterCategory = create<FilterCategoryState>((set) => ({
  status: FilterStatus[0].value,
  onChangeStatus: (status) => set({ status }),
}))
