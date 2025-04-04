'use client'

import { UpdateFormValues } from '@/features/auth/schema'

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

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const isPending = editMutation.isPending

  const { data } = userQuery

  if (!data) return null

  const defaultValues: UpdateFormValues = {
    name: data.name,
    cpfCnpj: data.cpfCnpj,
    whatsApp: data.whatsApp,
    role: data.role,
    address: data.address,
  }

  const onSubmit = (values: UpdateFormValues) => {
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
