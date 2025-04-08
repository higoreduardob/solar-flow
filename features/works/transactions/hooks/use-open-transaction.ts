import { create } from 'zustand'

type OpenTransactionState = {
  id?: string
  workId?: string
  isOpen: boolean
  isExpenses: boolean
  onOpen: (id: string, workId: string, isExpenses: boolean) => void
  onClose: () => void
}

export const useOpenTransaction = create<OpenTransactionState>((set) => ({
  id: undefined,
  workId: undefined,
  isOpen: false,
  isExpenses: false,
  onOpen: (id: string, workId: string, isExpenses: boolean) =>
    set({ isOpen: true, id, workId, isExpenses }),
  onClose: () => set({ isOpen: false, id: undefined, workId: undefined }),
}))
