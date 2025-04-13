import { useEffect } from 'react'
import { FileUser } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  InsertOwnerFormValues,
  insertOwnerSchema,
} from '@/features/manager/schema'

import { useNewUser } from '@/features/users/hooks/use-new-user'
import { useGetEnterpriseDocuments } from '@/features/manager/api/use-get-enterprise-documents'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CardData } from '@/components/card-data'
import { FormDialog } from '@/components/form-dialog'
import { SelectCreate } from '@/components/select-create'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: InsertOwnerFormValues
  handleClose: () => void
  onSubmit: (values: InsertOwnerFormValues) => void
}

export const FormOwner = ({
  id,
  isOpen,
  isPending,
  status,
  defaultValues,
  handleClose,
  onSubmit,
}: Props) => {
  const form = useForm<InsertOwnerFormValues>({
    resolver: zodResolver(insertOwnerSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  // console.log(form.formState.errors)

  const { onOpen: onOpenNewUser } = useNewUser()

  const watchOwners = form.watch('owners')

  const userDocumentsQuery = useGetEnterpriseDocuments(id, 'OWNER')
  const onCreateUser = () => {
    onOpenNewUser('OWNER')
  }

  const isLoadingUserDocuments = userDocumentsQuery.isLoading

  const userDocumentOptions: FilterOptionsProps = (
    userDocumentsQuery.data ?? []
  ).map((user) => ({
    label: user.name,
    value: user.id,
  }))
  const ownersOptions = watchOwners
    ? userDocumentOptions.filter((user) => !watchOwners.includes(user.value))
    : userDocumentOptions

  const handleSubmit = (values: InsertOwnerFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormDialog
      id={id}
      formId="form-owner"
      title="Editar proprietários"
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      status={status}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <Form {...form}>
        <form
          id="form-owner"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="owners"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="owners">Proprietários</FormLabel>
                <FormControl>
                  <SelectCreate
                    id="owners"
                    placeholder="Proprietários"
                    options={ownersOptions}
                    onCreate={onCreateUser}
                    value={''}
                    onChange={(owner) => {
                      const values = field.value
                      const newValues = values ? values.concat(owner!) : [owner]
                      field.onChange(newValues)
                    }}
                    disabled={isPending}
                    isLoading={isLoadingUserDocuments}
                  />
                </FormControl>
                <FormMessage />
                <CardData
                  title="Proprietários"
                  description="Veja aqui todos os proprietários desta empresa"
                  values={field.value}
                  icon={FileUser}
                  disabled={isPending}
                  options={userDocumentOptions}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  )
}
