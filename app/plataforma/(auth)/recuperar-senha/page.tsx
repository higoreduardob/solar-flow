'use client'

import { useForgotPassword } from '@/features/auth/api/use-forgot-password'
import { FormForgotPassword } from '@/features/auth/components/form-forgot-password'

import {
  forgotPasswordDefaultValues,
  ForgotPasswordFormValues,
} from '@/features/auth/schema'

export default function RecoveryPasswordPage() {
  const mutation = useForgotPassword()
  const isPending = mutation.isPending

  const defaultValues: ForgotPasswordFormValues = {
    ...forgotPasswordDefaultValues,
    role: 'OWNER',
  }

  const onSubmit = (values: ForgotPasswordFormValues) => {
    mutation.mutate(values)
  }

  return (
    <section>
      <FormForgotPassword
        isPending={isPending}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </section>
  )
}
