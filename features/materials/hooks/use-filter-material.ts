import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterMaterialState = {
  status: string
  onChangeStatus: (status: string) => void
}

export const useFilterMaterial = create<FilterMaterialState>((set) => ({
  status: FilterStatus[0].value,
  onChangeStatus: (status) => set({ status }),
}))
