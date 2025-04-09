import { WorkRole } from '@prisma/client'
import { create } from 'zustand'

import { FilterStatus } from '@/constants'

type FilterWorkState = {
  from?: string
  to?: string
  status: string
  role?: WorkRole
  onChangeStatus: (status: string) => void
  onChangeRole: (role: WorkRole) => void
  onChangeFilterDate: (from: string, to: string) => void
  onClearFilterDate: () => void
}

export const useFilterWork = create<FilterWorkState>((set) => ({
  from: undefined,
  to: undefined,
  status: FilterStatus[0].value,
  role: undefined,
  onChangeStatus: (status: string) => set((state) => ({ ...state, status })),
  onChangeRole: (role: WorkRole) => set((state) => ({ ...state, role })),
  onChangeFilterDate: (from: string, to: string) =>
    set((state) => ({ ...state, from, to })),
  onClearFilterDate: () =>
    set((state) => ({ ...state, from: undefined, to: undefined })),
}))
