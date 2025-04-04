import { toast } from 'sonner'
import { InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api)['categories'][':id']['undelete']['$patch']
>

export const useUndeleteCategory = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number }
  >({
    mutationFn: async () => {
      const response = await client.api['categories'][':id']['undelete'][
        '$patch'
      ]({
        param: { id },
      })

      if (!response.ok) {
        const data = await response.json()

        throw {
          message: data.error,
          status: response.status,
        }
      }

      return await response.json()
    },
    onSuccess: (res) => {
      if ('success' in res) {
        toast.success(res.success)
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', id] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
