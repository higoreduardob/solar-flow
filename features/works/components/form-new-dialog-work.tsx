import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertWorkDefaultValues,
  InsertWorkFormValues,
} from '@/features/works/schema'

import { useNewWork } from '@/features/works/hooks/use-new-work'
import { useCreateWork } from '@/features/works/api/use-create-work'

import { FormDialogWork } from '@/features/works/components/form-dialog-work'

export const FormDialogNewWork = () => {
  const { isOpen, onClose } = useNewWork()

  const mutation = useCreateWork()
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertWorkFormValues) => {
    const amount = convertAmountToMiliunits(values.amount)

    mutation.mutate(
      { ...values, amount },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <FormDialogWork
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertWorkDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
