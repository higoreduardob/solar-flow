import { create } from 'zustand'

import { UserRole } from '@prisma/client'

import { FilterStatus } from '@/constants'

type FilterUserState = {
  status: string
  role?: UserRole
  onChangeStatus: (status: string) => void
  onChangeRole: (role: UserRole) => void
}

export const useFilterUser = create<FilterUserState>((set) => ({
  status: FilterStatus[0].value,
  role: undefined,
  onChangeStatus: (status: string) => set((state) => ({ ...state, status })),
  onChangeRole: (role: UserRole) => set((state) => ({ ...state, role })),
}))
