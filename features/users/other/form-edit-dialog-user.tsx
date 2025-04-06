import { InsertDocumentFormValues } from '@/features/common/schema'
import { InsertUserFormValues, InsertUserSchema } from '@/features/users/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useGetUser } from '@/features/users/api/use-get-user'
import { useEditUser } from '@/features/users/api/use-edit-user'
import { useOpenUser } from '@/features/users/hooks/use-open-user'
import { useDeleteUser } from '@/features/users/api/use-delete-user'
import { useUndeleteUser } from '@/features/users/api/use-undelete-user'
import { useUploadMultipleFiles } from '@/features/common/api/use-upload-file'

import { FormDialogUser } from '@/features/users/other/form-dialog-user'

export const FormEditDialogUser = () => {
  const { id, isOpen, onClose } = useOpenUser()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const userQuery = useGetUser(id)
  const editMutation = useEditUser(id)
  const deleteMutation = useDeleteUser(id)
  const undeleteMutation = useUndeleteUser(id)
  const { mutateAsync: uploadFiles, isPending: uploadPending } =
    useUploadMultipleFiles('users')

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending ||
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
        const uploadedDocuments = await uploadFiles({
          files: documentsToUpload,
        })
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
