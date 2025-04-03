import Link from 'next/link'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { SignInFormValues, signInSchema } from '@/features/auth/schema'

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
import { InputPassword } from '@/components/input-custom'
import { ButtonLoading } from '@/components/button-custom'

type Props = {
  twoFactor: boolean
  isPending: boolean
  defaultValues: SignInFormValues
  onSubmit: (values: SignInFormValues) => void
}

export const FormSignIn = ({
  twoFactor,
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  const watchRole = form.watch('role')
  const recoveryPasswordLink =
    watchRole === 'ADMINISTRATOR'
      ? '/gestao/recuperar-senha'
      : '/plataforma/recuperar-senha'

  const { setValue } = form

  useEffect(() => {
    if (twoFactor) {
      setValue('code', '')
    }
  }, [twoFactor, setValue])

  const handleSubmit = (values: SignInFormValues) => {
    onSubmit(values)
  }

  return (
    <FormWrapper
      title="Entrar"
      description={`Digite seu ${
        twoFactor ? 'código' : 'e-mail e senha'
      } abaixo para acessar em sua conta`}
      footerTitle={watchRole !== 'ADMINISTRATOR' ? 'Cadastrar' : undefined}
      footerDescription={
        watchRole !== 'ADMINISTRATOR' ? 'Não possui uma conta?' : undefined
      }
      footerLink={watchRole !== 'ADMINISTRATOR' ? '/planos' : undefined}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          {twoFactor ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="Informe seu código"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Senha</FormLabel>
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
              <Link
                href={recoveryPasswordLink}
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </>
          )}
          <ButtonLoading className="w-fit" disabled={isPending}>
            {twoFactor ? 'Confirmar' : 'Entrar'}
          </ButtonLoading>
        </form>
      </Form>
    </FormWrapper>
  )
}
