import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits, formattedAddress } from '@/lib/utils'

export const useGetWork = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['works', id],
    queryFn: async () => {
      const response = await client.api['works'][':id'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return {
        ...data,
        amount: convertAmountFromMiliunits(data.amount),
        address: formattedAddress(data.address),
      }
    },
  })

  return query
}
