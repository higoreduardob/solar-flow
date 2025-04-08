'use client'

import { useMountedState } from 'react-use'

import { FormNewTransaction } from '@/features/works/transactions/components/form-new-transaction'
import { FormEditTransaction } from '@/features/works/transactions/components/form-edit-transaction'

import { FormNewWorkMaterial } from '@/features/works/materials/components/form-new-work-material'
import { FormEditWorkMaterial } from '@/features/works/materials/components/form-edit-work-material'

export const SheetProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return (
    <>
      <FormNewTransaction />
      <FormEditTransaction />

      <FormNewWorkMaterial />
      <FormEditWorkMaterial />
    </>
  )
}
