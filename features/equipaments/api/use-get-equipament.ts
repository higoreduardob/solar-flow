import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

export const useGetEquipament = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['equipaments', id],
    queryFn: async () => {
      const response = await client.api['equipaments'][':id'].$get({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return {
        ...data,
        power: convertAmountFromMiliunits(data.power),
        voc: convertAmountFromMiliunits(data.voc),
        isc: convertAmountFromMiliunits(data.isc),
        vmp: convertAmountFromMiliunits(data.vmp),
        imp: convertAmountFromMiliunits(data.imp),
      }
    },
  })

  return query
}
