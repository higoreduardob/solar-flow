import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetWorkTeams = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['works-teams', id],
    queryFn: async () => {
      const response = await client.api['works'][':id']['teams'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return { ...data, teams: data.teams.map((team) => team.teamId) }
    },
  })

  return query
}
