import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertMaterailInWorkDefaultValues,
  InsertMaterialInWorkFormValues,
} from '@/features/works/materials/schema'

import { useNewWorkMaterial } from '@/features/works/materials/hooks/use-new-work-material'
import { useCreateWorkMaterial } from '@/features/works/materials/api/use-create-work-material'

import { FormWorkMaterial } from '@/features/works/materials/components/form-work-material'

export const FormNewWorkMaterial = () => {
  const { isOpen, onClose, workId } = useNewWorkMaterial()

  const mutation = useCreateWorkMaterial(workId)
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertMaterialInWorkFormValues) => {
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
    <FormWorkMaterial
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertMaterailInWorkDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
