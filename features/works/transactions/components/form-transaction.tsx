import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  insertTransactionFormSchema,
  InsertTransactionFormValues,
} from '@/features/works/transactions/schema'

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
import { FormSheet } from '@/components/form-sheet'
import { AmountInput } from '@/components/amount-input'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  isExpenses: boolean
  defaultValues: InsertTransactionFormValues
  onSubmit: (values: InsertTransactionFormValues) => void
  onDelete?: () => void
  handleClose: () => void
}

export const FormTransaction = ({
  id,
  isOpen,
  isPending,
  isExpenses,
  defaultValues,
  onSubmit,
  onDelete,
  handleClose,
}: Props) => {
  const form = useForm<InsertTransactionFormValues>({
    resolver: zodResolver(insertTransactionFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const handleSubmit = (values: InsertTransactionFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormSheet
      id={id}
      formId="form-transaction"
      title={id ? 'Editar transação' : 'Nova transação'}
      description="Preencha todos os campos abaixo, e ao finalizar clique em salvar."
      isOpen={isOpen}
      isPending={isPending}
      onDelete={onDelete}
      handleClose={handleClose}
    >
      <Form {...form}>
        <form
          id="form-transaction"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Identificação</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Identificação da transação"
                    disabled={isPending}
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
                    placeholder="Valor da transação"
                    isPending={isPending}
                    isExpenses={isExpenses}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
    </FormSheet>
  )
}
