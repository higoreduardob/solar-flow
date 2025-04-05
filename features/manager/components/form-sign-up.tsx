'use client'

import { generateStrongPassword } from '@/lib/utils'
import { signUpDefaultValues, SignUpFormValues } from '@/features/auth/schema'

import { useSignUp } from '@/features/manager/api/use-sign-up'
import { useNewNewSignUp } from '@/features/manager/hooks/use-new-sign-up'
import { useNewEnterprise } from '@/features/manager/hooks/use-new-enterprise'

import { FormDialog } from '@/components/form-dialog'
import { FormSignUp } from '@/features/auth/components/form-sign-up'

export const FormSingUp = () => {
  const { isOpen, onClose } = useNewNewSignUp()
  const { onOpen } = useNewEnterprise()

  const mutation = useSignUp()
  const isPending = mutation.isPending
  const password = generateStrongPassword()

  const defaultValues: SignUpFormValues = {
    ...signUpDefaultValues,
    password,
    repeatPassword: password,
    role: 'OWNER',
  }

  const onSubmit = (values: SignUpFormValues) => {
    mutation.mutate(values, {
      onSuccess: (res) => {
        onClose()
        if ('token' in res && 'password' in res) {
          onOpen(res.token, res.password)
        }
      },
    })
  }

  return (
    <FormDialog
      formId="form-sign-up"
      title="Cadastrar usuário"
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      handleClose={onClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <FormSignUp
        formId="form-sign-up"
        isPending={isPending}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </FormDialog>
  )
}
