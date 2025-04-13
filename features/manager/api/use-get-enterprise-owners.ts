import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetEnterpriseOwners = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['enterprise-owners', id],
    queryFn: async () => {
      const response = await client.api['manager']['enterprises'][':id'][
        'owners'
      ].$get({
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
