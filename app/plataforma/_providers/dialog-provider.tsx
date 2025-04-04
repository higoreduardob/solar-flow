'use client'

import { useMountedState } from 'react-use'

import { FormNewMaterial } from '@/features/materials/components/form-new-material'
import { FormEditMaterial } from '@/features/materials/components/form-edit-material'

import { TableCategory } from '@/features/materials/categories/components/table-category'
import { FormNewCategory } from '@/features/materials/categories/components/form-new-category'
import { FormEditCategory } from '@/features/materials/categories/components/form-edit-category'

import { TableMeasure } from '@/features/materials/measures/components/table-measure'
import { FormNewMeasure } from '@/features/materials/measures/components/form-new-measure'
import { FormEditMeasure } from '@/features/materials/measures/components/form-edit-measure'

export const DialogProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return (
    <>
      <FormNewMaterial />
      <FormEditMaterial />

      <TableCategory />
      <FormNewCategory />
      <FormEditCategory />

      <TableMeasure />
      <FormNewMeasure />
      <FormEditMeasure />
    </>
  )
}
