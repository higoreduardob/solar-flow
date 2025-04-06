import { toast } from 'sonner'
import { InferRequestType, InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api)['equipaments'][':id']['$patch']
>

type RequestType = InferRequestType<
  (typeof client.api)['equipaments'][':id']['$patch']
>['json']

export const useEditEquipament = (id?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api['equipaments'][':id']['$patch']({
        param: { id },
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
      queryClient.invalidateQueries({ queryKey: ['equipaments', id] }) // TODO: Refatch failed
      queryClient.invalidateQueries({ queryKey: ['equipaments'] }) // TODO: Refatch failed
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
