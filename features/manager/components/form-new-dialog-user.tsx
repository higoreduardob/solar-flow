import { generateStrongPassword } from '@/lib/utils'
import { signUpDefaultValues, SignUpFormValues } from '@/features/auth/schema'

import { useNewUser } from '@/features/users/hooks/use-new-user'
import { useCreateUser } from '@/features/manager/api/use-create-user'

import { FormDialog } from '@/components/form-dialog'
import { FormSignUp } from '@/features/auth/components/form-sign-up'

export const FormNewDialogUser = () => {
  const { isOpen, role, onClose } = useNewUser()

  const mutation = useCreateUser()
  const isPending = mutation.isPending
  const password = generateStrongPassword()

  if (!role) return null

  const defaultValues: SignUpFormValues = {
    ...signUpDefaultValues,
    password,
    repeatPassword: password,
    role,
  }

  const onSubmit = (values: SignUpFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
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
