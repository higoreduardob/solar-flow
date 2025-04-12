import {
  insertUserDefaultValues,
  InsertUserFormValues,
  InsertUserSchema,
} from '@/features/users/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useNewUser } from '@/features/users/hooks/use-new-user'
import { useCreateUser } from '@/features/users/api/use-create-user'

import { FormDialogUser } from '@/features/users/components/form-dialog-user'

export const FormNewDialogUser = () => {
  const { isOpen, role, onClose } = useNewUser()

  const mutation = useCreateUser()
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('users')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('users')

  const isPending = mutation.isPending || uploadMultiplePending || uploadPending

  if (!role) return null

  const onSubmit = async (values: InsertUserFormValues) => {
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
      ) as InsertDocumentFormValues[]

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

        handleSubmit({
          ...values,
          documents: allDocuments,
        })
      } else {
        handleSubmit({
          ...values,
          documents: storedDocuments,
        })
      }
    } else {
      handleSubmit({
        ...values,
        documents: null,
      })
    }
  }

  const handleSubmit = (values: InsertUserSchema) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormDialogUser
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={{ ...insertUserDefaultValues, role }}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
