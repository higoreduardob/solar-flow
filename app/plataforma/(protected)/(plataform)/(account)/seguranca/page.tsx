'use client'

import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { useUpdatePassword } from '@/features/auth/api/use-update-password'

import {
  UpdatePasswordFormValues,
  updatePasswordDefaultValues,
} from '@/features/auth/schema'

import { TitleProtected as Title } from '@/components/title-custom'
import { FormUpdatePassword } from '@/features/auth/components/form-update-password'

export default function SecurityPage() {
  const { user } = useCurrentUser()

  const mutation = useUpdatePassword(user?.id)
  const isPending = mutation.isPending

  if (!user) return null

  const onSubmit = (values: UpdatePasswordFormValues) => {
    mutation.mutate(values)
  }

  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <Title>Segurança</Title>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo, e ao finalizar clique em “Salvar”.
        </p>
        <FormUpdatePassword
          isPending={isPending}
          defaultValues={updatePasswordDefaultValues}
          onSubmit={onSubmit}
        />
      </div>
    </section>
  )
}
