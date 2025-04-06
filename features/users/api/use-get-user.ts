import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { formattedAddress } from '@/lib/utils'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

export const useGetUser = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await client.api['users'][':id'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return {
        ...data,
        whatsApp: phoneMask(data.whatsApp),
        cpfCnpj: cpfCnpjMask(data.cpfCnpj),
        address: formattedAddress(data.address),
      }
    },
  })

  return query
}
