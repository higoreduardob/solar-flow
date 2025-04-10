import { create } from 'zustand'

type FilterSummaryState = {
  from?: string
  to?: string
  onChangeFilterDate: (from: string, to: string) => void
  onClearFilterDate: () => void
}

export const useFilterSummary = create<FilterSummaryState>((set) => ({
  from: undefined,
  to: undefined,
  onChangeFilterDate: (from: string, to: string) =>
    set((state) => ({ ...state, from, to })),
  onClearFilterDate: () =>
    set((state) => ({ ...state, from: undefined, to: undefined })),
}))
