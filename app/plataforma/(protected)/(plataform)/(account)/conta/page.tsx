'use client'

import { mapSessionToUpdateData } from '@/lib/utils'

import { UpdateFormValues } from '@/features/auth/schema'

import { useUpdate } from '@/features/auth/api/use-update'
import { useUpdate2fa } from '@/features/auth/api/use-update-2fa'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import { FormUpdate } from '@/features/auth/components/form-update'
import { TitleProtected as Title } from '@/components/title-custom'
import { FormUpdate2FA } from '@/features/auth/components/form-update-2fa'

export default function AccountPage() {
  const { user, update } = useCurrentUser()

  if (!user) return null

  const { id, isTwoFactorEnabled } = user
  const mutationUpdate = useUpdate(id)
  const mutation2fa = useUpdate2fa(id)

  const isPending = mutationUpdate.isPending || mutation2fa.isPending

  const onSubmitUpdate = (values: UpdateFormValues) => {
    mutationUpdate.mutate(values, {
      onSuccess: async () => {
        await update()
      },
    })
  }

  const onSubmit2fa = () =>
    mutation2fa.mutate(
      { param: { id } },
      {
        onSuccess: async () => {
          update()
        },
      },
    )

  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Title>Conta</Title>
          <FormUpdate2FA
            isPending={mutation2fa.isPending}
            isTwoFactorEnabled={isTwoFactorEnabled}
            onSubmit={onSubmit2fa}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo, e ao finalizar clique em “Salvar”.
        </p>
        <FormUpdate
          isPending={isPending}
          defaultValues={mapSessionToUpdateData(user)}
          onSubmit={onSubmitUpdate}
        />
      </div>
    </section>
  )
}
