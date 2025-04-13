import { toast } from 'sonner'
import { InferRequestType, InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[':id']['works'][':workId']['$patch']
>
type RequestType = InferRequestType<
  (typeof client.api.transactions)[':id']['works'][':workId']['$patch']
>['json']

export const useEditTransaction = (id?: string, workId?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.transactions[':id']['works'][':workId'][
        '$patch'
      ]({
        param: { id, workId },
        json,
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['works'] })
      queryClient.invalidateQueries({ queryKey: ['summaries'] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
