import { create } from 'zustand'

type NewTransactionState = {
  workId?: string
  isOpen: boolean
  isExpenses: boolean
  onOpen: (workId: string, isExpenses: boolean) => void
  onClose: () => void
}

export const useNewTransaction = create<NewTransactionState>((set) => ({
  workId: undefined,
  isOpen: false,
  isExpenses: false,
  onOpen: (workId: string, isExpenses: boolean) =>
    set({ isOpen: true, workId, isExpenses }),
  onClose: () => set({ isOpen: false, workId: undefined }),
}))
