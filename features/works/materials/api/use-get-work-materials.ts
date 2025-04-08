import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

export const useGetWorkMaterials = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['works-materials', id],
    queryFn: async () => {
      const response = await client.api['works'][':id']['materials'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return {
        ...data,
        materials: data.materials.map((material) => ({
          ...material,
          amount: convertAmountFromMiliunits(material.amount),
        })),
      }
    },
  })

  return query
}
