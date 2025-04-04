import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  insertMeasureSchema,
  InsertMeasureFormValues,
} from '@/features/materials/measures/schema'

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
  status?: boolean
  defaultValues: InsertMeasureFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertMeasureFormValues) => void
}

export const FormMeasure = ({
  id,
  isOpen,
  isPending,
  status,
  defaultValues,
  onDelete,
  handleClose,
  onSubmit,
}: Props) => {
  const form = useForm<InsertMeasureFormValues>({
    resolver: zodResolver(insertMeasureSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const handleSubmit = (values: InsertMeasureFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormDialog
      id={id}
      formId="form-measure"
      title={id ? 'Editar unidade' : 'Nova unidade'}
      description="Preencha os campos abaixo, e ao finalizar clique em “Salvar”."
      isOpen={isOpen}
      isPending={isPending}
      status={status}
      onDelete={onDelete}
      handleClose={handleClose}
      className="max-w-[90%] md:max-w-lg"
    >
      <Form {...form}>
        <form
          id="form-measure"
          className="flex flex-col gap-4"
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
                    placeholder="Nome da categoria"
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
