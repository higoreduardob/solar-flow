import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

import { useFilterEquipament } from '@/features/equipaments/hooks/use-filter-equipament'

export const useGetEquipaments = () => {
  const { status } = useFilterEquipament()

  const query = useQuery({
    queryKey: ['equipaments', status],
    queryFn: async () => {
      const response = await client.api['equipaments'].$get({
        query: { status },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return data.map((equipament) => ({
        ...equipament,
        power: convertAmountFromMiliunits(equipament.power),
        voc: convertAmountFromMiliunits(equipament.voc),
        isc: convertAmountFromMiliunits(equipament.isc),
        vmp: convertAmountFromMiliunits(equipament.vmp),
        imp: convertAmountFromMiliunits(equipament.imp),
        circuitBreaker: convertAmountFromMiliunits(equipament.circuitBreaker),
        mppt: convertAmountFromMiliunits(equipament.mppt),
        quantityString: convertAmountFromMiliunits(equipament.quantityString),
      }))
    },
  })

  return query
}
