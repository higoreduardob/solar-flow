import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

export const useGetWorkMaterial = (id?: string, workId?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['work-materials', id],
    queryFn: async () => {
      const response = await client.api.works[':id']['materials'][
        ':materialId'
      ].$get({
        param: { id: workId, materialId: id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return { ...data, amount: convertAmountFromMiliunits(data.amount) }
    },
  })

  return query
}
