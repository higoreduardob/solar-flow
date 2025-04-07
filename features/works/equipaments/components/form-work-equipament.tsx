import { Plus } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { EquipamentRole } from '@prisma/client'

import { translateEquipamentRole } from '@/lib/i18n'

import { useGetEquipaments } from '@/features/equipaments/api/use-get-equipaments'
import { useNewEquipament } from '@/features/equipaments/hooks/use-new-equipament'

import {
  equipamentItemDefaultValues,
  EquipamentItemFormValues,
  equipamentItemSchema,
  InsertEquipamentInWorkFormValues,
  insertEquipamentInWorkSchema,
} from '@/features/works/equipaments/schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SelectCreate } from '@/components/select-create'

type Props = {
  isPending: boolean
  defaultValues: InsertEquipamentInWorkFormValues
  onSubmit: (values: InsertEquipamentInWorkFormValues) => void
}

export const FormWorkEquipament = ({
  isPending,
  defaultValues,
  onSubmit,
}: Props) => {
  const form = useForm<InsertEquipamentInWorkFormValues>({
    resolver: zodResolver(insertEquipamentInWorkSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'equipaments',
  })

  const handleSubmit = (values: InsertEquipamentInWorkFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="grid xl:grid-cols-2 gap-2">
          <FormEquipamentRole
            role="PLATE"
            isPending={isPending}
            onAdd={(equipament) => append(equipament)}
          />
          <FormEquipamentRole
            role="INVERTER"
            isPending={isPending}
            onAdd={(equipament) => append(equipament)}
          />
        </div>
        <Button
          type="submit"
          className="mt-4 w-fit"
          disabled={isPending || fields.length === 0}
        >
          Salvar equipamentos
        </Button>
      </form>
    </Form>
  )
}

const FormEquipamentRole = ({
  role,
  isPending,
  onAdd,
}: {
  role: EquipamentRole
  isPending: boolean
  onAdd: (equipament: EquipamentItemFormValues) => void
}) => {
  const { onOpen: onOpenNewEquipament } = useNewEquipament()

  const form = useForm<EquipamentItemFormValues>({
    resolver: zodResolver(equipamentItemSchema),
    defaultValues: equipamentItemDefaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const equipamentsQuery = useGetEquipaments()
  const onCreateEquipament = () => onOpenNewEquipament()
  const equipamentOptions: FilterOptionsProps = (equipamentsQuery.data ?? [])
    .filter((equipament) => equipament.role === role)
    .map((equipament) => ({
      label: equipament.name,
      value: equipament.id,
    }))
  const isLoadingEquipaments = equipamentsQuery.isLoading

  const handleAddEquipament = form.handleSubmit((values) => {
    onAdd(values)
    form.reset()
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="equipamentId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel htmlFor={`${role}-select`}>
                {translateEquipamentRole(role)}
              </FormLabel>
              <FormControl>
                <SelectCreate
                  id={`${role}-select`}
                  placeholder={translateEquipamentRole(role)}
                  options={equipamentOptions}
                  onCreate={onCreateEquipament}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  isLoading={isLoadingEquipaments}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel htmlFor={`${role}-quantity`}>Quantidade</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id={`${role}-quantity`}
                  type="number"
                  value={field.value || ''}
                  disabled={isPending}
                  placeholder="Quantidade"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        className="w-fit mt-2"
        onClick={handleAddEquipament}
        disabled={!form.formState.isValid}
      >
        <Plus className="mr-2" />
        Adicionar {translateEquipamentRole(role)}
      </Button>
    </div>
  )
}
