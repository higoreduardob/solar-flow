import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { cpfCnpjMask, phoneMask } from '@/lib/format'

export const useGetEnterprises = () => {
  const query = useQuery({
    queryKey: ['enterprises'],
    queryFn: async () => {
      const response = await client.api['manager']['enterprises'].$get()

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
