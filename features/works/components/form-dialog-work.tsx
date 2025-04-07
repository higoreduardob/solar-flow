import { InsertWorkFormValues } from '@/features/works/schema'

import { FormDialog } from '@/components/form-dialog'
import { FormWork } from '@/features/works/components/form-work'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: InsertWorkFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertWorkFormValues) => void
}

export const FormDialogWork = ({
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
      formId="form-work"
      title={id ? 'Editar obra' : 'Nova obra'}
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      status={status}
      onDelete={onDelete}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <FormWork
        id={id}
        formId="form-work"
        isOpen={isOpen}
        isPending={isPending}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </FormDialog>
  )
}
