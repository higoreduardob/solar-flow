import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { searchZipCode } from '@/lib/apis'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

import { SignUpFormValues, signUpSchema } from '@/features/auth/schema'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { InputPassword } from '@/components/input-custom'
import { ProgressPassword } from '@/components/progress-custom'

type Props = {
  formId?: string
  isPending?: boolean
  defaultValues: SignUpFormValues
  onSubmit: (values: SignUpFormValues) => void
}

export const FormSignUp = ({
  formId,
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const handleSubmit = (values: SignUpFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Informe seu nome completo"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="whatsApp"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={({ target: { value } }) =>
                      field.onChange(phoneMask(value))
                    }
                    value={field.value || ''}
                    placeholder="WhatsApp de contato"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpfCnpj"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={({ target: { value } }) =>
                      field.onChange(cpfCnpjMask(value))
                    }
                    value={field.value || ''}
                    placeholder="Informe seu CPF"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="address.zipCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={async ({ target: { value } }) => {
                      field.onChange(zipCodeMask(value))
                      const response = await searchZipCode(value)
                      if (response) {
                        form.setValue('address.street', response.street)
                        form.setValue('address.city', response.city)
                        form.setValue('address.state', response.state)
                        form.setValue(
                          'address.neighborhood',
                          response.neighborhood,
                        )
                      }
                    }}
                    value={field.value || ''}
                    placeholder="CEP"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.neighborhood"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Bairro"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    value={field.value || ''}
                    placeholder="Número do endereço"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    value={field.value || ''}
                    placeholder="Cidade"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    value={field.value || ''}
                    placeholder="Estado"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Rua"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    value={field.value || ''}
                    placeholder="Complemento do endereço"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex flex-col gap-1 w-full">
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
            {form.getValues('password') && (
              <ProgressPassword password={form.watch('password')} />
            )}
          </div>
          <FormField
            control={form.control}
            name="repeatPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Repetir senha</FormLabel>
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
        <FormField
          control={form.control}
          name="hasAcceptedTerms"
          render={({ field }) => (
            <FormItem className="w-full">
              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    disabled={isPending}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Termos de uso</FormLabel>
                  <FormDescription>
                    Você aceita os{' '}
                    <Link href="/termos-de-uso" className="underline">
                      termos
                    </Link>{' '}
                    e{' '}
                    <Link
                      href="/politicas-de-privacidade"
                      className="underline"
                    >
                      políticas de privacidade
                    </Link>
                    ?
                  </FormDescription>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
