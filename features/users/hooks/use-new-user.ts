import { create } from 'zustand'

import { UserRole } from '@prisma/client'

type NewUserState = {
  isOpen: boolean
  role?: UserRole
  onOpen: (role: UserRole) => void
  onClose: () => void
}

export const useNewUser = create<NewUserState>((set) => ({
  isOpen: false,
  role: undefined,
  onOpen: (role: UserRole) => set({ isOpen: true, role }),
  onClose: () => set({ isOpen: false, role: undefined }),
}))
