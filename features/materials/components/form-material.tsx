import { useEffect } from 'react'
import { Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useGetMeasures } from '@/features/materials/measures/api/use-get-measures'
import { useCreateMeasure } from '@/features/materials/measures/api/use-create-measure'
import { useGetCategories } from '@/features/materials/categories/api/use-get-categories'
import { useOpenMeasureData } from '@/features/materials/measures/hooks/use-open-measure'
import { useCreateCategory } from '@/features/materials/categories/api/use-create-category'
import { useOpenCategoryData } from '@/features/materials/categories/hooks/use-open-category'

import {
  insertMaterialFormSchema,
  InsertMaterialFormValues,
} from '@/features/materials/schema'

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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { InputFile } from '@/components/input-file'
import { FormDialog } from '@/components/form-dialog'
import { Separator } from '@/components/ui/separator'
import { AmountInput } from '@/components/amount-input'
import { SelectCreate } from '@/components/select-create'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: InsertMaterialFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertMaterialFormValues) => void
}

export const FormMaterial = ({
  id,
  isOpen,
  isPending,
  status,
  defaultValues,
  onDelete,
  handleClose,
  onSubmit,
}: Props) => {
  const form = useForm<InsertMaterialFormValues>({
    resolver: zodResolver(insertMaterialFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })
  const { onOpen: onOpenCategoryData } = useOpenCategoryData()
  const { onOpen: onOpenMeasureData } = useOpenMeasureData()

  const categoriesQuery = useGetCategories()
  const categoryMutation = useCreateCategory()
  const categoryOptions: FilterOptionsProps = (categoriesQuery.data ?? []).map(
    (category) => ({
      label: category.name,
      value: category.id,
    }),
  )
  const onCreateCategory = (name: string) => categoryMutation.mutate({ name })
  const isLoadingCreateCategory = categoryMutation.isPending

  const measuresQuery = useGetMeasures()
  const measureMutation = useCreateMeasure()
  const measureOptions: FilterOptionsProps = (measuresQuery.data ?? []).map(
    (category) => ({
      label: category.name,
      value: category.id,
    }),
  )
  const onCreateMeasure = (name: string) => measureMutation.mutate({ name })
  const isLoadingCreateMeasure = measureMutation.isPending

  const handleSubmit = (values: InsertMaterialFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormDialog
      id={id}
      formId="form-material"
      title={id ? 'Editar material' : 'Novo material'}
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
          id="form-material"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                      placeholder="Nome do material"
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
                      placeholder="Informe valor do material"
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
              name="supplier"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      disabled={isPending}
                      placeholder="Fabricante do material"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-between">
                    <FormLabel htmlFor="category">Categoria</FormLabel>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-muted-foreground"
                      type="button"
                      onClick={onOpenCategoryData}
                    >
                      <Eye className="size-4" />
                      Todos
                    </Button>
                  </div>
                  <FormControl>
                    <SelectCreate
                      id="category"
                      placeholder="Categoria"
                      options={categoryOptions}
                      onCreate={onCreateCategory}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      isLoading={isLoadingCreateCategory}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="measureId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex items-center justify-between">
                    <FormLabel htmlFor="measure">Unidade de medida</FormLabel>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-muted-foreground"
                      type="button"
                      onClick={onOpenMeasureData}
                    >
                      <Eye className="size-4" />
                      Todos
                    </Button>
                  </div>
                  <FormControl>
                    <SelectCreate
                      id="measure"
                      placeholder="Unidade de medida"
                      options={measureOptions}
                      onCreate={onCreateMeasure}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      isLoading={isLoadingCreateMeasure}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Estoque</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      disabled={isPending}
                      placeholder="Quantidade de material"
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
            name="document"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="document">Documento</FormLabel>
                <FormControl>
                  <InputFile
                    id="document"
                    value={field.value}
                    onChange={field.onChange}
                    multiple={false}
                  />
                </FormControl>
                <FormDescription>
                  Envie um único documento (PDF, DOCX, DWG, PNG, etc.)
                </FormDescription>
                <FormMessage />
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
                    placeholder="Observações do material"
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
