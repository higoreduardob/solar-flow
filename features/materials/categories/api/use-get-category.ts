import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetCategory = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await client.api['categories'][':id'].$get({
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
