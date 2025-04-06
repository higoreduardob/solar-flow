import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { cpfCnpjMask, phoneMask } from '@/lib/format'

import { useFilterUser } from '@/features/users/hooks/use-filter-user'

export const useGetUsers = () => {
  const { role, status } = useFilterUser()

  const query = useQuery({
    queryKey: ['users', role, status],
    queryFn: async () => {
      const response = await client.api['users'].$get({
        query: { role, status },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data.map((user) => ({
        ...user,
        whatsApp: phoneMask(user.whatsApp),
        cpfCnpj: cpfCnpjMask(user.cpfCnpj),
      }))
    },
  })

  return query
}
