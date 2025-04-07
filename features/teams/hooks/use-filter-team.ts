import { create } from 'zustand'

type FilterTeamState = {
  status?: string
  onChangeStatus: (status: string) => void
}

export const useFilterTeam = create<FilterTeamState>((set) => ({
  status: undefined,
  onChangeStatus: (status) => set({ status }),
}))
