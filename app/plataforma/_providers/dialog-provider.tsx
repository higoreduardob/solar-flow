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

import { FormNewEquipament } from '@/features/equipaments/components/form-new-equipament'
import { FormEditEquipament } from '@/features/equipaments/components/form-edit-equipament'

import { FormNewDialogUser } from '@/features/users/other/form-new-dialog-user'
import { FormEditDialogUser } from '@/features/users/other/form-edit-dialog-user'

import { TableTeam } from '@/features/teams/components/table-team'
import { FormNewTeam } from '@/features/teams/components/form-new-team'
import { FormEditTeam } from '@/features/teams/components/form-edit-team'

import { FormDialogNewWork } from '@/features/works/components/form-new-dialog-work'

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

      <FormNewEquipament />
      <FormEditEquipament />

      <FormNewDialogUser />
      <FormEditDialogUser />

      <TableTeam />
      <FormNewTeam />
      <FormEditTeam />

      <FormDialogNewWork />
    </>
  )
}
