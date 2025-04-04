'use client'

import { useMountedState } from 'react-use'

import { FormSingUp } from '@/features/manager/components/form-sign-up'
import { FormEditUser } from '@/features/manager/components/form-edit-user'
import { FormNewEnterprise } from '@/features/manager/components/form-new-enterprise'

export const DialogProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return (
    <>
      <FormSingUp />
      <FormEditUser />
      <FormNewEnterprise />
    </>
  )
}
