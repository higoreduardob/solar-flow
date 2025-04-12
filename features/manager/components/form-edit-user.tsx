import { InsertDocumentFormValues } from '@/features/common/schema'
import { InsertUserFormValues, InsertUserSchema } from '@/features/users/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useConfirm } from '@/hooks/use-confirm'
import { useGetUser } from '@/features/manager/api/use-get-user'
import { useOpenUser } from '@/features/users/hooks/use-open-user'
import { useEditUser } from '@/features/manager/api/use-edit-user'
import { useDeleteUser } from '@/features/manager/api/use-delete-user'
import { useUndeleteUser } from '@/features/manager/api/use-undelete-user'

import { FormDialogUser } from '@/features/users/components/form-dialog-user'

export const FormEditUser = () => {
  const { id, isOpen, onClose } = useOpenUser()

  const userQuery = useGetUser(id)
  const editMutation = useEditUser(id)
  const deleteMutation = useDeleteUser(id)
  const undeleteMutation = useUndeleteUser(id)
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('users')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('users')

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending ||
    uploadMultiplePending ||
    uploadPending

  const { data } = userQuery

  if (!data) return null

  const defaultValues: InsertUserFormValues = {
    name: data.name,
    email: data.email,
    whatsApp: data.whatsApp,
    cpfCnpj: data.cpfCnpj,
    role: data.role,
    address: data.address,
    status: data.status,
    documents: data.documents,
  }

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
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  const handleDelete = async () => {
    const ok = await confirm()

    if (ok) {
      if (data.status)
        deleteMutation.mutate(undefined, {
          onSuccess: () => {
            onClose()
          },
        })
      else
        undeleteMutation.mutate(undefined, {
          onSuccess: () => {
            onClose()
          },
        })
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <FormDialogUser
        id={id}
        isOpen={isOpen}
        isPending={isPending}
        status={data.status}
        defaultValues={defaultValues}
        onDelete={handleDelete}
        handleClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  )
}
