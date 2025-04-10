import { useEffect } from 'react'
import { FileUser } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { InsertTeamFormValues, insertTeamSchema } from '@/features/teams/schema'

import { useNewUser } from '@/features/users/hooks/use-new-user'
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
import { CardData } from '@/components/card-data'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Separator } from '@/components/ui/separator'
import { SelectCreate } from '@/components/select-create'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: InsertTeamFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertTeamFormValues) => void
}

export const FormTeam = ({
  id,
  isOpen,
  isPending,
  status,
  defaultValues,
  onDelete,
  handleClose,
  onSubmit,
}: Props) => {
  const form = useForm<InsertTeamFormValues>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const { onOpen: onOpenNewUser } = useNewUser()

  const watchEmployees = form.watch('employees')

  const userDocumentsQuery = useGetUserDocuments('EMPLOYEE')
  const onCreateUser = () => {
    onOpenNewUser('EMPLOYEE')
  }

  const isLoadingUserDocuments = userDocumentsQuery.isLoading

  const userDocumentOptions: FilterOptionsProps = (
    userDocumentsQuery.data ?? []
  ).map((user) => ({
    label: user.name,
    value: user.id,
  }))
  const employeesOptions = watchEmployees
    ? userDocumentOptions.filter((user) => !watchEmployees.includes(user.value))
    : userDocumentOptions

  const handleSubmit = (values: InsertTeamFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormDialog
      id={id}
      formId="form-team"
      title={id ? 'Editar equipe' : 'Novo equipe'}
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      status={status}
      onDelete={onDelete}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-3xl"
    >
      <Form {...form}>
        <form
          id="form-team"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Nome da equipe"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employees"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="employees">Colaborador</FormLabel>
                <FormControl>
                  <SelectCreate
                    id="employees"
                    placeholder="Colaboradores"
                    options={employeesOptions}
                    onCreate={onCreateUser}
                    value={''}
                    onChange={(employee) => {
                      const values = field.value
                      const newValues = values
                        ? values.concat(employee!)
                        : [employee]
                      field.onChange(newValues)
                    }}
                    disabled={isPending}
                    isLoading={isLoadingUserDocuments}
                  />
                </FormControl>
                <FormMessage />
                <CardData
                  title="Colaboradores"
                  description="Veja aqui todos os colaboradores desta equipe"
                  values={field.value}
                  icon={FileUser}
                  disabled={isPending}
                  options={userDocumentOptions}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
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
                    placeholder="Observações da equipe"
                    disabled={isPending}
                    className="resize-none h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormDialog>
  )
}
