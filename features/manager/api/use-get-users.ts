import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

import { useFilterUser } from '@/features/users/hooks/use-filter-user'

export const useGetUsers = () => {
  const { role, status } = useFilterUser()

  const query = useQuery({
    queryKey: ['users', role, status],
    queryFn: async () => {
      const response = await client.api['manager'].$get({
        query: { role, status },
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
