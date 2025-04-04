import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

import { useFilterMaterial } from '@/features/materials/hooks/use-filter-material'

export const useGetMaterials = () => {
  const { status } = useFilterMaterial()

  const query = useQuery({
    queryKey: ['materials', status],
    queryFn: async () => {
      const response = await client.api['materials'].$get({
        query: { status },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data.map((material) => ({
        ...material,
        amount: convertAmountFromMiliunits(material.amount),
      }))
    },
  })

  return query
}
