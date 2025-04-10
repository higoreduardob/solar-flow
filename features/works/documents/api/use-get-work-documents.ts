import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'

export const useGetWorkDocuments = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ['works-documents', id],
    queryFn: async () => {
      const response = await client.api['works'][':id']['documents'].$get({
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
