import { WorkRole } from '@prisma/client'
import { create } from 'zustand'

type FilterWorkState = {
  status?: string
  role?: WorkRole
  onChangeStatus: (status: string) => void
}

export const useFilterWork = create<FilterWorkState>((set) => ({
  status: undefined,
  role: undefined,
  onChangeStatus: (status: string) => set((state) => ({ ...state, status })),
  onChangeRole: (role: WorkRole) => set((state) => ({ ...state, role })),
}))
