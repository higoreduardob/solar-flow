import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import type { InferRequestType } from 'hono'

import { client } from '@/lib/hono'

import type { InsertDocumentFormValues } from '@/features/common/schema'

interface FileUploadResponse {
  data: InsertDocumentFormValues
}

type RequestType = InferRequestType<
  (typeof client.api.uploads.file)['$post']
>['form']

export const useUploadFile = (folder?: string) => {
  const mutation = useMutation<
    InsertDocumentFormValues,
    { message: string; status: number },
    RequestType
  >({
    mutationFn: async (formData) => {
      const response = await client.api.uploads.file.$post({
        query: { folder },
        form: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw {
          message: data.error || 'Falha no upload do arquivo',
          status: response.status,
        }
      }

      const res = (await response.json()) as FileUploadResponse

      if (!res.data || !res.data.url) {
        throw {
          message: 'Resposta inválida do servidor',
          status: response.status,
        }
      }

      return res.data
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  return mutation
}
