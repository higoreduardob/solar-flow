import { toast } from 'sonner'
import { InferResponseType, InferRequestType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<(typeof client.api)['teams']['$post']>

type RequestType = InferRequestType<
  (typeof client.api)['teams']['$post']
>['json']

export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api['teams'].$post({ json })

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
      queryClient.invalidateQueries({ queryKey: ['teams'] }) // TODO: Refatch failed
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
