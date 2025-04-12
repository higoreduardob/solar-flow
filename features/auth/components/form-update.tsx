import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { searchZipCode } from '@/lib/apis'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

import { updateFormSchema, UpdateFormValues } from '@/features/auth/schema'

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
import { InputFile } from '@/components/input-file'
import { Separator } from '@/components/ui/separator'
import { ButtonLoading } from '@/components/button-custom'

type FormUpdateProps = {
  isPending: boolean
  defaultValues: UpdateFormValues
  onSubmit: (values: UpdateFormValues) => void
}

export const FormUpdate = ({
  isPending,
  defaultValues,
  onSubmit,
}: FormUpdateProps) => {
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  // console.log(form.formState.errors)

  const handleSubmit = (values: UpdateFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <h4 className="text-sm">Informações pessoais</h4>
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
                    placeholder="Informe seu nome"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    onChange={({ target: { value } }) =>
                      field.onChange(cpfCnpjMask(value))
                    }
                    value={field.value || ''}
                    placeholder="CPF/CNPJ do usuário"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h4 className="text-sm">Informações de endereço</h4>
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
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
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
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
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
        <Separator className="my-4" />
        <FormField
          control={form.control}
          name="documents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Múltiplos documentos</FormLabel>
              <FormControl>
                <InputFile
                  value={field.value}
                  onChange={field.onChange}
                  multiple={true}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Envie vários documentos (PDF, DOCX, PNG, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonLoading disabled={isPending} className="w-fit">
          Salvar
        </ButtonLoading>
      </form>
    </Form>
  )
}
