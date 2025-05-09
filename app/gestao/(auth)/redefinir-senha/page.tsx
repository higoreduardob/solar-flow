'use client'

import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

import { useResetPassword } from '@/features/auth/api/use-reset-password'

import {
  ResetPasswordFormValues,
  resetPasswordDefaultValues,
} from '@/features/auth/schema'

import { FormResetPassword } from '@/features/auth/components/form-reset-password'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? undefined

  const mutation = useResetPassword(token)
  const isPending = mutation.isPending
  const url = '/gestao/entrar'

  if (!token) {
    toast.error('Token inválido')
    router.push(url)
    return null
  }

  const defaultValues: ResetPasswordFormValues = {
    ...resetPasswordDefaultValues,
    role: 'ADMINISTRATOR',
  }

  const onSubmit = (values: ResetPasswordFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        router.push(url)
      },
    })
  }

  return (
    <section>
      <FormResetPassword
        defaultValues={defaultValues}
        isPending={isPending}
        onSubmit={onSubmit}
      />
    </section>
  )
}
