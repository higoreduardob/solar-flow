import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetWorkEquipaments = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['works-equipaments', id],
    queryFn: async () => {
      const response = await client.api['works'][':id']['equipaments'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data
    },
  })

  return query
}
