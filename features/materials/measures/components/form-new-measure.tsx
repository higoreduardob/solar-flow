import {
  insertMeasureDefaultValues,
  InsertMeasureFormValues,
} from '@/features/materials/measures/schema'

import { useNewMeasure } from '@/features/materials/measures/hooks/use-new-measure'
import { useCreateMeasure } from '@/features/materials/measures/api/use-create-measure'

import { FormMeasure } from '@/features/materials/measures/components/form-measure'

export const FormNewMeasure = () => {
  const { isOpen, onClose } = useNewMeasure()

  const mutation = useCreateMeasure()
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertMeasureFormValues) => {
    mutation.mutate(
      { ...values },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <FormMeasure
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertMeasureDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
