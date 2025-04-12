import { InsertUserFormValues } from '@/features/users/schema'

import { FormDialog } from '@/components/form-dialog'
import { FormUser } from '@/features/users/components/form-user'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  isNonUpdated?: boolean
  status?: boolean
  defaultValues: InsertUserFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertUserFormValues) => void
}

export const FormDialogUser = ({
  id,
  isOpen,
  isPending,
  isNonUpdated = true,
  status,
  defaultValues,
  onDelete,
  handleClose,
  onSubmit,
}: Props) => {
  return (
    <FormDialog
      id={id}
      formId="form-user"
      title={id ? 'Editar usuário' : 'Novo usuário'}
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      status={status}
      onDelete={onDelete}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <FormUser
        id={id}
        formId="form-user"
        isPending={isPending}
        status={status}
        isNonUpdated={isNonUpdated}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />
    </FormDialog>
  )
}
