import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterTeamState = {
  status: string
  onChangeStatus: (status: string) => void
}

export const useFilterTeam = create<FilterTeamState>((set) => ({
  status: FilterStatus[0].value,
  onChangeStatus: (status) => set({ status }),
}))
