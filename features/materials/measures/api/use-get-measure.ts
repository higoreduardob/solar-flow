import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetMeasure = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['measures', id],
    queryFn: async () => {
      const response = await client.api['measures'][':id'].$get({
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
