import { create } from 'zustand'

import { UserRole } from '@prisma/client'

type FilterUserState = {
  status?: string
  role?: UserRole
  onChangeStatus: (status: string) => void
  onChangeRole: (role: UserRole) => void
}

export const useFilterUser = create<FilterUserState>((set) => ({
  status: undefined,
  role: undefined,
  onChangeStatus: (status: string) => set((state) => ({ ...state, status })),
  onChangeRole: (role: UserRole) => set((state) => ({ ...state, role })),
}))
