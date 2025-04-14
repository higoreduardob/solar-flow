import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { searchZipCode } from '@/lib/apis'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

import {
  InsertEnterpriseFormValues,
  insertEnterpriseSchema,
} from '@/features/enterprise/schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/form-dialog'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  defaultValues: InsertEnterpriseFormValues
  onSubmit: (values: InsertEnterpriseFormValues) => void
  handleClose: () => void
}

export const FormEnterprise = ({
  id,
  isOpen,
  isPending,
  defaultValues,
  onSubmit,
  handleClose,
}: Props) => {
  const form = useForm<InsertEnterpriseFormValues>({
    resolver: zodResolver(insertEnterpriseSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const handleSubmit = (values: InsertEnterpriseFormValues) => {
    onSubmit(values)
  }

  return (
    <FormDialog
      id={id}
      formId="form-enterprise"
      title={id ? 'Editar empresa' : 'Nova empresa'}
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <Form {...form}>
        <form
          id="form-enterprise"
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
                      placeholder="Informe nome da empresa"
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
                      placeholder="Informe email da empresa"
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
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      onChange={({ target: { value } }) =>
                        field.onChange(cpfCnpjMask(value))
                      }
                      value={field.value || ''}
                      placeholder="Informe seu CNPJ"
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
        </form>
      </Form>
    </FormDialog>
  )
}
