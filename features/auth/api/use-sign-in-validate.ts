import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { InferRequestType, InferResponseType } from 'hono'

import { client } from '@/lib/hono'

type ResponseType = InferResponseType<
  (typeof client.api.authenticate)['sign-in']['validate']['$post']
>
type RequestType = InferRequestType<
  (typeof client.api.authenticate)['sign-in']['validate']['$post']
>

export const useSignInValidate = () => {
  const mutation = useMutation<
    ResponseType,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async () => {
      const response =
        await client.api.authenticate['sign-in']['validate']['$post']()

      if (!response.ok) {
        throw {
          message: 'Sessão inválida faça login novamente',
          status: response.status,
        }
      }

      return await response.json()
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
