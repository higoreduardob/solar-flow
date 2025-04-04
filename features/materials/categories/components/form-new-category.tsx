'use client'

import {
  insertCategoryDefaultValues,
  InsertCategoryFormValues,
} from '@/features/materials/categories/schema'

import { useNewCategory } from '@/features/materials/categories/hooks/use-new-category'
import { useCreateCategory } from '@/features/materials/categories/api/use-create-category'

import { FormCategory } from '@/features/materials/categories/components/form-category'

export const FormNewCategory = () => {
  const { isOpen, onClose } = useNewCategory()

  const mutation = useCreateCategory()
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertCategoryFormValues) => {
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
    <FormCategory
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertCategoryDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
