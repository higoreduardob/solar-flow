import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/features/auth/schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormWrapper } from '@/components/form-wrapper'
import { InputPassword } from '@/components/input-custom'
import { ButtonLoading } from '@/components/button-custom'
import { ProgressPassword } from '@/components/progress-custom'

type Props = {
  isPending: boolean
  defaultValues: ResetPasswordFormValues
  onSubmit: (values: ResetPasswordFormValues) => void
}

export const FormResetPassword = ({
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  const watchPassword = form.watch('password')

  const handleSubmit = (values: ResetPasswordFormValues) => {
    onSubmit(values)
    form.reset()
  }

  return (
    <FormWrapper
      title="Recuperar senha"
      description="Informe o email da sua conta"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-col gap-1 w-full">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <InputPassword
                        {...field}
                        placeholder="Informe sua senha"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchPassword && <ProgressPassword password={watchPassword} />}
            </div>
            <FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Repetir nova senha</FormLabel>
                  <FormControl>
                    <InputPassword
                      {...field}
                      placeholder="Repita sua senha"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <ButtonLoading className="w-fit" disabled={isPending}>
            Redefinir senha
          </ButtonLoading>
        </form>
      </Form>
    </FormWrapper>
  )
}
