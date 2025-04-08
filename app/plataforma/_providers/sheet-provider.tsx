'use client'

import { useMountedState } from 'react-use'

import { FormNewTransaction } from '@/features/works/transactions/components/form-new-transaction'
import { FormEditTransaction } from '@/features/works/transactions/components/form-edit-transaction'

export const SheetProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return (
    <>
      <FormNewTransaction />
      <FormEditTransaction />
    </>
  )
}
