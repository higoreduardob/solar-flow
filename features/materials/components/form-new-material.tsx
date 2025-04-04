'use client'

import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertMaterialDefaultValues,
  InsertMaterialFormValues,
} from '@/features/materials/schema'

import { useNewMaterial } from '@/features/materials/hooks/use-new-material'
import { useCreateMaterial } from '@/features/materials/api/use-create-material'

import { FormMaterial } from '@/features/materials/components/form-material'

export const FormNewMaterial = () => {
  const { isOpen, onClose } = useNewMaterial()

  const mutation = useCreateMaterial()
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertMaterialFormValues) => {
    mutation.mutate(
      { ...values, amount: convertAmountToMiliunits(values.amount) },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <FormMaterial
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertMaterialDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
