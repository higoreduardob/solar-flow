import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  insertMaterialInWorkFormSchema,
  InsertMaterialInWorkFormValues,
} from '@/features/works/materials/schema'

import { useGetMaterials } from '@/features/materials/api/use-get-materials'
import { useNewMaterial } from '@/features/materials/hooks/use-new-material'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormSheet } from '@/components/form-sheet'
import { Separator } from '@/components/ui/separator'
import { AmountInput } from '@/components/amount-input'
import { SelectCreate } from '@/components/select-create'
import { TooltipMaterial } from '@/features/works/materials/components/tooltip-material'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  defaultValues: InsertMaterialInWorkFormValues
  onSubmit: (values: InsertMaterialInWorkFormValues) => void
  onDelete?: () => void
  handleClose: () => void
}

export const FormWorkMaterial = ({
  id,
  isOpen,
  isPending,
  defaultValues,
  onSubmit,
  onDelete,
  handleClose,
}: Props) => {
  const form = useForm<InsertMaterialInWorkFormValues>({
    resolver: zodResolver(insertMaterialInWorkFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const { onOpen: onOpenNewMaterial } = useNewMaterial()

  const materialsQuery = useGetMaterials()
  const onCreateMaterial = () => onOpenNewMaterial()
  const materialOptions: FilterOptionsProps = Array.isArray(materialsQuery.data)
    ? materialsQuery.data.map((material) => ({
        label: material.name,
        value: material.id,
      }))
    : []
  const isLoadingMaterials = materialsQuery.isLoading

  const watchMaterial = form.watch('materialId')
  const selectedMaterial = Array.isArray(materialsQuery.data)
    ? materialsQuery.data.find((material) => material.id === watchMaterial)
    : undefined

  const handleSubmit = (values: InsertMaterialInWorkFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  return (
    <FormSheet
      id={id}
      formId="form-work-material"
      title={id ? 'Editar material' : 'Nova material'}
      description="Preencha todos os campos abaixo, e ao finalizar clique em salvar."
      isOpen={isOpen}
      isPending={isPending}
      onDelete={onDelete}
      handleClose={handleClose}
    >
      <Form {...form}>
        <form
          id="form-work-material"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="materialId"
            render={({ field }) => (
              <FormItem className="w-full">
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="materialId">Material</FormLabel>
                  <TooltipMaterial />
                </div>
                <FormControl>
                  <SelectCreate
                    id="materialId"
                    placeholder="Material"
                    options={materialOptions}
                    onCreate={onCreateMaterial}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    isLoading={isLoadingMaterials}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid sm:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Quantidade de material"
                      disabled={isPending}
                      onChange={(e) => {
                        const quantity = parseFloat(e.target.value)
                        if (!quantity || !selectedMaterial) return
                        // TODO: Get preview amount for amoutn avg
                        // Bug in value lower in this current and stock too
                        const { stock, amount: amountMaterial } =
                          selectedMaterial
                        if (stock < quantity) {
                          form.setError('quantity', {
                            message: 'Estoque insuficiente',
                          })
                          return
                        }

                        form.clearErrors('quantity')

                        const amount = amountMaterial * quantity

                        form.setValue('quantity', quantity)
                        form.setValue('amount', String(amount))
                      }}
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
                  <FormLabel>Custo</FormLabel>
                  <FormControl>
                    <AmountInput
                      {...field}
                      placeholder="Custo de material para obra"
                      isPending={true}
                      isTooltip={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {selectedMaterial && (
            <>
              <Separator className="my-4" />

              <div className="grid sm:grid-cols-2 gap-2">
                <FormItem className="w-full">
                  <FormLabel>Unidade de medida</FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      placeholder="Unidade de medida do material"
                      value={selectedMaterial.measure?.name}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="w-full">
                  <FormLabel>Estoque</FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      placeholder="Estoque do material"
                      value={selectedMaterial.stock}
                    />
                  </FormControl>
                </FormItem>
              </div>
              <FormItem className="w-full">
                <FormLabel>Valor unitário</FormLabel>
                <FormControl>
                  <AmountInput
                    placeholder="Valor unitário do material"
                    isTooltip={false}
                    isPending={true}
                    onChange={(value) => {}}
                    value={selectedMaterial.amount.toString()}
                  />
                </FormControl>
              </FormItem>
            </>
          )}
        </form>
      </Form>
    </FormSheet>
  )
}
