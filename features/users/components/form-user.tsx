import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { UserRole } from '@prisma/client'

import { searchZipCode } from '@/lib/apis'
import { generateStrongPassword } from '@/lib/utils'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

import {
  insertUserFormSchema,
  InsertUserFormValues,
} from '@/features/users/schema'

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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { InputFile } from '@/components/input-file'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  id?: string
  formId?: string
  isPending: boolean
  isNonUpdated?: boolean
  status?: boolean
  defaultValues: InsertUserFormValues
  onSubmit: (values: InsertUserFormValues) => void
  onDelete?: () => void
}

export const FormUser = ({
  id,
  formId,
  isPending,
  isNonUpdated = true,
  status,
  defaultValues,
  onSubmit,
  onDelete,
}: Props) => {
  const form = useForm<InsertUserFormValues>({
    resolver: zodResolver(insertUserFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const watchRole = form.watch('role')
  const isManager = watchRole === 'MANAGER'
  const isChangeRole = watchRole !== 'CUSTOMER' && isNonUpdated

  const handleSubmit = (values: InsertUserFormValues) => {
    onSubmit(values)
  }

  const handleDelete = () => {
    onDelete?.()
  }

  useEffect(() => {
    if (watchRole !== 'CUSTOMER') {
      const password = generateStrongPassword()
      form.setValue('password', password)
      form.setValue('repeatPassword', password)
    }
  }, [watchRole, form])

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          {isChangeRole &&
            watchRole !== 'ADMINISTRATOR' &&
            watchRole !== 'OWNER' && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Privilégio do usuário</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                        defaultValue={field.value}
                        className="flex items-center gap-3"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value={UserRole.MANAGER}
                              className="hidden"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            <Badge variant={isManager ? 'default' : 'outline'}>
                              Gerente
                            </Badge>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value={UserRole.EMPLOYEE}
                              className="hidden"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            <Badge variant={isManager ? 'outline' : 'default'}>
                              Colaborador
                            </Badge>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="!line-clamp-1">
                      Nível de acesso do usuário
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}
          {id && (
            <div className="ml-auto flex justify-end">
              <FormField
                control={form.control}
                name="status"
                render={() => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel htmlFor="status">
                      {status ? 'Bloquear' : 'Desbloquear'}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        id="status"
                        checked={!status}
                        onCheckedChange={handleDelete}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

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
                    placeholder="Informe o nome"
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
                    placeholder="Informe o email"
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

        <Separator className="my-4" />

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
                    disabled
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
      </form>
    </Form>
  )
}
