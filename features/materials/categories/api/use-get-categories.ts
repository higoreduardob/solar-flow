import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

import { useFilterCategory } from '@/features/materials/categories/hooks/use-filter-category'

export const useGetCategories = () => {
  const { status } = useFilterCategory()

  const query = useQuery({
    queryKey: ['categories', status],
    queryFn: async () => {
      const response = await client.api['categories'].$get({
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
