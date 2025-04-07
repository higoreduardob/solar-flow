import { useQuery } from '@tanstack/react-query'

import { UserRole } from '@prisma/client'

import { client } from '@/lib/hono'
import { cpfCnpjMask, phoneMask } from '@/lib/format'

export const useGetUserDocuments = (role?: UserRole) => {
  const query = useQuery({
    enabled: !!role,
    queryKey: ['users', 'documents', role],
    queryFn: async () => {
      const response = await client.api['users']['documents'].$get({
        query: { role },
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
