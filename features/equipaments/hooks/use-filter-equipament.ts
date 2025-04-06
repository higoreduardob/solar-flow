import { create } from 'zustand'

type FilterEquipamentState = {
  status?: string
  onChangeStatus: (status: string) => void
}

export const useFilterEquipament = create<FilterEquipamentState>((set) => ({
  status: undefined,
  onChangeStatus: (status) => set({ status }),
}))
