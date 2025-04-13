import { toast } from 'sonner'
import { InferResponseType } from 'hono'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.works)[':id']['materials'][':materialId']['$delete']
>

export const useDeleteWorkMaterial = (id?: string, workId?: string) => {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    ResponseType,
    { message: string; status: number }
  >({
    mutationFn: async () => {
      const response = await client.api.works[':id']['materials'][
        ':materialId'
      ]['$delete']({
        param: { id: workId, materialId: id },
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
      queryClient.invalidateQueries({ queryKey: ['work-materials'] })
      queryClient.invalidateQueries({ queryKey: ['works'] })
      queryClient.invalidateQueries({ queryKey: ['summaries'] })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
