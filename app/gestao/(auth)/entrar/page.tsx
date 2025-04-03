'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useSignIn } from '@/features/auth/api/use-sign-in'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import { signInDefaultValues, SignInFormValues } from '@/features/auth/schema'

import { FormSignIn } from '@/features/auth/components/form-sign-in'

export default function SignInPage() {
  const router = useRouter()
  const [redirect, setRedirect] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)

  const { update } = useCurrentUser()
  const mutation = useSignIn()
  const isPending = mutation.isPending

  const defaultValues: SignInFormValues = {
    ...signInDefaultValues,
    role: 'ADMINISTRATOR',
  }

  const onSubmit = (values: SignInFormValues) => {
    mutation.mutate(values, {
      onSuccess: (res) => {
        if (res) {
          if ('twoFactor' in res) {
            setTwoFactor(true)
          }
          if ('redirect' in res) {
            setRedirect(res.redirect as string)
            if ('update' in res) {
              update()
            }
          }
        }
      },
    })
  }

  useEffect(() => {
    if (redirect) {
      router.push(redirect)
    }
  }, [redirect])

  return (
    <section>
      <FormSignIn
        defaultValues={defaultValues}
        isPending={isPending}
        onSubmit={onSubmit}
        twoFactor={twoFactor}
      />
    </section>
  )
}
