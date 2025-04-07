import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { phoneMask } from '@/lib/format'
import { convertAmountFromMiliunits } from '@/lib/utils'

import { useFilterWork } from '@/features/works/hooks/use-filter-work'

export const useGetWorks = () => {
  const { status } = useFilterWork()

  const query = useQuery({
    queryKey: ['works', status],
    queryFn: async () => {
      const response = await client.api['works'].$get({
        query: { status },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data.map((work) => ({
        ...work,
        customer: {
          ...work.customer,
          whatsApp: phoneMask(work.customer.whatsApp),
        },
        amount: convertAmountFromMiliunits(work.amount),
      }))
    },
  })

  return query
}
