import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@/features/auth/schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormWrapper } from '@/components/form-wrapper'
import { ButtonLoading } from '@/components/button-custom'

type Props = {
  isPending: boolean
  defaultValues: ForgotPasswordFormValues
  onSubmit: (values: ForgotPasswordFormValues) => void
}

export const FormForgotPassword = ({
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  const watchRole = form.watch('role')

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    onSubmit(values)
  }

  return (
    <FormWrapper
      title="Recuperar senha"
      description="Informe o email da sua conta"
      footerTitle="Entrar"
      footerDescription="Lembrou sua senha?"
      footerLink={watchRole !== 'ADMINISTRATOR' ? '/entrar' : '/gestao/entrar'}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Informe seu email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ButtonLoading className="w-fit" disabled={isPending}>
            Recuperar senha
          </ButtonLoading>
        </form>
      </Form>
    </FormWrapper>
  )
}
