'use client'

import { useMountedState } from 'react-use'

import { FormSingUp } from '@/features/manager/components/form-sign-up'
import { FormEditUser } from '@/features/manager/components/form-edit-user'

import { FormEditOwner } from '@/features/manager/components/form-edit-owner'
import { FormNewEnterprise } from '@/features/manager/components/form-new-enterprise'
import { FormEditEnterprise } from '@/features/manager/components/form-edit-enterprise'
import { FormNewDialogUser } from '@/features/manager/components/form-new-dialog-user'

export const DialogProvider = () => {
  const isMounted = useMountedState()

  if (!isMounted) return null

  return (
    <>
      <FormSingUp />
      <FormEditUser />
      <FormNewDialogUser />

      <FormEditOwner />
      <FormNewEnterprise />
      <FormEditEnterprise />
    </>
  )
}
