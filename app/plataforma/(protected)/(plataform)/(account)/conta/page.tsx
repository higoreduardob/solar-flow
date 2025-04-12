'use client'

import { mapSessionToUpdateData } from '@/lib/utils'

import { InsertDocumentFormValues } from '@/features/common/schema'
import { UpdateFormValues, UpdateSchema } from '@/features/auth/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useUpdate } from '@/features/auth/api/use-update'
import { useUpdate2fa } from '@/features/auth/api/use-update-2fa'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import { FormUpdate } from '@/features/auth/components/form-update'
import { TitleProtected as Title } from '@/components/title-custom'
import { FormUpdate2FA } from '@/features/auth/components/form-update-2fa'

export default function AccountPage() {
  const { user, update } = useCurrentUser()

  const mutationUpdate = useUpdate(user?.id)
  const mutation2fa = useUpdate2fa(user?.id)
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('users')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('users')

  if (!user) return null

  const isPending =
    mutationUpdate.isPending ||
    mutation2fa.isPending ||
    uploadMultiplePending ||
    uploadPending

  const onSubmitUpdate = async (values: UpdateFormValues) => {
    const { documents } = values

    if (documents && documents.length > 0) {
      const documentsToUpload = documents.filter(
        (document): document is File => document instanceof File,
      )
      const storedDocuments = documents.filter(
        (document): document is InsertDocumentFormValues =>
          document !== null &&
          document !== undefined &&
          !(document instanceof File),
      )

      if (documentsToUpload.length > 0) {
        const uploadedDocumentsRaw =
          documentsToUpload.length === 1
            ? await uploadFile({
                file: documentsToUpload[0],
              })
            : await uploadFiles({
                files: documentsToUpload,
              })

        const uploadedDocuments = Array.isArray(uploadedDocumentsRaw)
          ? uploadedDocumentsRaw
          : [uploadedDocumentsRaw]

        const allDocuments = [...uploadedDocuments, ...storedDocuments]

        handleSubmitUpdate({
          ...values,
          documents: allDocuments,
        })
      } else {
        handleSubmitUpdate({
          ...values,
          documents: storedDocuments,
        })
      }
    } else {
      handleSubmitUpdate({
        ...values,
        documents: null,
      })
    }
  }

  const handleSubmitUpdate = (values: UpdateSchema) => {
    mutationUpdate.mutate(values, {
      onSuccess: async () => {
        await update()
      },
    })
  }

  const onSubmit2fa = () =>
    mutation2fa.mutate(
      { param: { id: user.id } },
      {
        onSuccess: async () => {
          update()
        },
      },
    )

  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Title>Conta</Title>
          <FormUpdate2FA
            isPending={mutation2fa.isPending}
            isTwoFactorEnabled={user.isTwoFactorEnabled}
            onSubmit={onSubmit2fa}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo, e ao finalizar clique em “Salvar”.
        </p>
        <FormUpdate
          isPending={isPending}
          defaultValues={mapSessionToUpdateData(user)}
          onSubmit={onSubmitUpdate}
        />
      </div>
    </section>
  )
}
