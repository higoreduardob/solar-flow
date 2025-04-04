import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

export const useGetMaterial = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['materials', id],
    queryFn: async () => {
      const response = await client.api['materials'][':id'].$get({
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
      }
    },
  })

  return query
}
