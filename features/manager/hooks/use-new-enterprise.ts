import { create } from 'zustand'

type NewEnterpriseState = {
  isOpen: boolean
  token?: string
  password?: string
  onOpen: (token: string, password: string) => void
  onClose: () => void
}

export const useNewEnterprise = create<NewEnterpriseState>((set) => ({
  isOpen: false,
  token: undefined,
  password: undefined,
  onOpen: (token: string, password: string) =>
    set({ isOpen: true, token, password }),
  onClose: () => set({ isOpen: false, token: undefined, password: undefined }),
}))
