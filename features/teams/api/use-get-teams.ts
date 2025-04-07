import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

import { useFilterTeam } from '@/features/teams/hooks/use-filter-team'

export const useGetTeams = () => {
  const { status } = useFilterTeam()

  const query = useQuery({
    queryKey: ['teams', status],
    queryFn: async () => {
      const response = await client.api['teams'].$get({
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
