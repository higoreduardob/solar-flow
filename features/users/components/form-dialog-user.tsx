import { UpdateFormValues } from '@/features/auth/schema'

import { FormDialog } from '@/components/form-dialog'
import { FormUser } from '@/features/users/components/form-user'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: UpdateFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: UpdateFormValues) => void
}

export const FormDialogUser = ({
  id,
  isOpen,
  isPending,
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
        formId="form-user"
        defaultValues={defaultValues}
        isPending={isPending}
        onSubmit={onSubmit}
      />
    </FormDialog>
  )
}
