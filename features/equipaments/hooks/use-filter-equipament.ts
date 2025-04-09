import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterEquipamentState = {
  status: string
  onChangeStatus: (status: string) => void
}

export const useFilterEquipament = create<FilterEquipamentState>((set) => ({
  status: FilterStatus[0].value,
  onChangeStatus: (status) => set({ status }),
}))
