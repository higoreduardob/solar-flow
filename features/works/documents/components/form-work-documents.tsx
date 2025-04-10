import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  insertDocumentInWorkFormSchema,
  InsertDocumentInWorkFormValues,
} from '@/features/works/documents/schema'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { InputFile } from '@/components/input-file'

type Props = {
  formId?: string
  isPending: boolean
  defaultValues: InsertDocumentInWorkFormValues
  onSubmit: (values: InsertDocumentInWorkFormValues) => void
}

export const FormWorkDocuments = ({
  formId,
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<InsertDocumentInWorkFormValues>({
    resolver: zodResolver(insertDocumentInWorkFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const handleSubmit = (values: InsertDocumentInWorkFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
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
        <Button className="sm:w-fit w-full" disabled={isPending}>
          Salvar
        </Button>
      </form>
    </Form>
  )
}
