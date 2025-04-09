import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CircleX, Timer } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  insertWorkFormSchema,
  InsertWorkFormValues,
} from '@/features/works/schema'

import { searchZipCode } from '@/lib/apis'
import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

import { useNewUser } from '@/features/users/hooks/use-new-user'
import { useGetUsers } from '@/features/users/api/use-get-users'
import { useGetUserDocuments } from '@/features/users/api/use-get-user-documents'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/date-picker'
import { AmountInput } from '@/components/amount-input'
import { SelectCreate } from '@/components/select-create'
import { ButtonLoading } from '@/components/button-custom'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  id?: string
  formId?: string
  isOpen?: boolean
  isPending: boolean
  blocked?: boolean
  defaultValues: InsertWorkFormValues
  onSubmit: (values: InsertWorkFormValues) => void
  onCompleted?: () => void
  onCanceled?: () => void
}

export const FormWork = ({
  id,
  formId,
  isOpen,
  isPending,
  blocked,
  defaultValues,
  onSubmit,
  onCompleted,
  onCanceled,
}: Props) => {
  const form = useForm<InsertWorkFormValues>({
    resolver: zodResolver(insertWorkFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const watchIsAddressCustomer = form.watch('isAddressCustomer')

  const { onOpen: onOpenNewUser } = useNewUser()

  const customerDocumentsQuery = useGetUserDocuments('CUSTOMER')
  const customerDocumentOptions: FilterOptionsProps = (
    customerDocumentsQuery.data ?? []
  ).map((user) => ({
    label: `${user.name} | ${cpfCnpjMask(user.cpfCnpj)}`,
    value: user.id,
  }))
  const onCreateCustomer = () => {
    onOpenNewUser('CUSTOMER')
  }
  const isLoadingCustomerDocuments = customerDocumentsQuery.isLoading

  const usersQuery = useGetUsers()
  const userOptions: FilterOptionsProps = (usersQuery.data ?? []).map(
    (user) => ({
      label: user.name,
      value: user.id,
    }),
  )
  const onCreateUser = () => {
    onOpenNewUser('EMPLOYEE')
  }
  const isLoadingUsers = customerDocumentsQuery.isLoading

  const handleSubmit = (values: InsertWorkFormValues) => {
    const address = watchIsAddressCustomer ? null : values.address
    onSubmit({ ...values, address })
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  useEffect(() => {
    form.clearErrors('address')
  }, [watchIsAddressCustomer])

  return (
    <Form {...form}>
      <form
        id={formId}
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {id && (
          <div className="flex items-center flex-col sm:flex-row justify-end gap-2 w-full">
            <ButtonLoading
              type="button"
              variant="primary"
              disabled={isPending || blocked}
              blocked={blocked}
              onClick={onCompleted}
              className="sm:w-fit w-full"
            >
              <Timer className="size-4 mr-2" />
              Entregar obra
            </ButtonLoading>
            <ButtonLoading
              type="button"
              variant="destructive"
              disabled={isPending || blocked}
              blocked={blocked}
              onClick={onCanceled}
              className="sm:w-fit w-full"
            >
              <CircleX className="size-4 mr-2" />
              Cancelar obra
            </ButtonLoading>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="customer">Cliente</FormLabel>
                <FormControl>
                  <SelectCreate
                    id="customer"
                    placeholder="Cliente"
                    options={customerDocumentOptions}
                    onCreate={onCreateCustomer}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    isLoading={isLoadingCustomerDocuments}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <AmountInput
                    {...field}
                    placeholder="Informe valor do obra"
                    isPending={isPending}
                    isTooltip={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Contato</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={phoneMask(
                      customerDocumentsQuery.data?.find(
                        (customer) => customer.id === field.value,
                      )?.whatsApp || '',
                    )}
                    disabled
                    placeholder="Fabricante do material"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="responsibleId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="responsible">Responsável</FormLabel>
                <FormControl>
                  <SelectCreate
                    id="responsible"
                    placeholder="Responsável pela obra"
                    options={userOptions}
                    onCreate={onCreateUser}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    isLoading={isLoadingUsers}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="designerId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="designer">Projetista</FormLabel>
                <FormControl>
                  <SelectCreate
                    id="designer"
                    placeholder="Projetista da obra"
                    options={userOptions}
                    onCreate={onCreateUser}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    isLoading={isLoadingUsers}
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
          name="startDateOfWork"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Data de início</FormLabel>
              <FormControl>
                <DatePicker
                  id="orderDate"
                  value={field.value || undefined}
                  label="Início da obra"
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Data do pedido</FormLabel>
                <FormControl>
                  <DatePicker
                    id="orderDate"
                    value={field.value || undefined}
                    label="Pedido do equipamento"
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="equipamentArrivalDate"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Data de chegada</FormLabel>
                <FormControl>
                  <DatePicker
                    id="orderDate"
                    value={field.value || undefined}
                    label="Chegada do equipamento"
                    onChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {id && (
            <>
              <FormField
                control={form.control}
                name="approvalDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Data da homologação</FormLabel>
                    <FormControl>
                      <DatePicker
                        id="orderDate"
                        value={field.value || undefined}
                        label="Homologação da obra"
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Data da entrega</FormLabel>
                    <FormControl>
                      <DatePicker
                        id="orderDate"
                        value={field.value || undefined}
                        label="Entrega da obra"
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <Separator className="my-4" />
        <FormField
          control={form.control}
          name="isAddressCustomer"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Local da instalação</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value ? 'true' : 'false'}
                  className="flex items-center gap-3"
                  disabled={isPending}
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value={'true'} className="hidden" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      <Badge
                        variant={field.value ? 'default' : 'outline'}
                        className={isPending ? 'cursor-not-allowed' : ''}
                      >
                        Endereço do cliente
                      </Badge>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value={'false'} className="hidden" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      <Badge
                        variant={field.value ? 'outline' : 'default'}
                        className={isPending ? 'cursor-not-allowed' : ''}
                      >
                        Outro endereço
                      </Badge>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="circuitBreaker"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Disjuntor geral</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    value={field.value || ''}
                    disabled={isPending}
                    placeholder="Disjuntor da obra"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="uc"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>UC</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    disabled={isPending}
                    placeholder="UC da obra"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!watchIsAddressCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                      disabled
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
        )}
        {id && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="coordinates"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Coordenadas</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Coordenadas da obra"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="xLat"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Coordenada UTM X</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Coordenada UTM X da obra"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yLat"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Coordenada UTM Y</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Coordenada UTM Y da obra"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Latitude da obra"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="long"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Longitude da obra"
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
              name="obs"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Observações da obra"
                      disabled={isPending}
                      className="resize-none h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </form>
    </Form>
  )
}
