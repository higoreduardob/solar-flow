import { toast } from 'sonner'
import { InferRequestType, InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.works)[':id']['materials'][':materialId']['$patch']
>
type RequestType = InferRequestType<
  (typeof client.api.works)[':id']['materials'][':materialId']['$patch']
>['json']

export const useEditWorkMaterial = (id?: string, workId?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.works[':id']['materials'][
        ':materialId'
      ]['$patch']({
        param: { id: workId, materialId: id },
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
      queryClient.invalidateQueries({ queryKey: ['works', id] }) // TODO: Refatch failed
      queryClient.invalidateQueries({ queryKey: ['works'] }) // TODO: Refatch failed
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
