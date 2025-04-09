import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { phoneMask } from '@/lib/format'
import { convertAmountFromMiliunits } from '@/lib/utils'

import { useFilterWork } from '@/features/works/hooks/use-filter-work'

export const useGetWorks = () => {
  const { status, role, from, to } = useFilterWork()

  const query = useQuery({
    queryKey: ['works', status, role, from, to],
    queryFn: async () => {
      const response = await client.api['works'].$get({
        query: { status, role, from, to },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data.map((work) => ({
        ...work,
        whatsApp: phoneMask(work.whatsApp),
        amount: convertAmountFromMiliunits(work.amount),
        expenses: convertAmountFromMiliunits(work.expenses),
        incomes: convertAmountFromMiliunits(work.incomes),
        remaining: convertAmountFromMiliunits(work.remaining),
      }))
    },
  })

  return query
}
