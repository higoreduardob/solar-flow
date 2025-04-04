import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { cpfCnpjMask, phoneMask } from '@/lib/format'
import { formattedAddress } from '@/lib/utils'

export const useGetUser = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await client.api['manager'][':id'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      const { address } = data
      return {
        ...data,
        whatsApp: phoneMask(data.whatsApp),
        cpfCnpj: cpfCnpjMask(data.cpfCnpj),
        address: formattedAddress(address),
      }
    },
  })

  return query
}
