import { WorkRole } from '@prisma/client'
import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterWorkState = {
  status: string
  role?: WorkRole
  onChangeStatus: (status: string) => void
}

export const useFilterWork = create<FilterWorkState>((set) => ({
  status: FilterStatus[0].value,
  role: undefined,
  onChangeStatus: (status: string) => set((state) => ({ ...state, status })),
  onChangeRole: (role: WorkRole) => set((state) => ({ ...state, role })),
}))
