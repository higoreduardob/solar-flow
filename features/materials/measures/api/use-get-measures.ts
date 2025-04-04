import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

import { useFilterMeasure } from '@/features/materials/measures/hooks/use-filter-measure'

export const useGetMeasures = () => {
  const { status } = useFilterMeasure()

  const query = useQuery({
    queryKey: ['measures', status],
    queryFn: async () => {
      const response = await client.api['measures'].$get({
        query: { status },
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
