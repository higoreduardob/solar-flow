import { CircleX, EthernetPort, LucideProps, Plus, Sunset } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { cn } from '@/lib/utils'

import type { EquipamentRole } from '@prisma/client'

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
            fields={fields}
            icon={Sunset}
            onAdd={(equipament) => append(equipament)}
            onRemove={(index) => remove(index)}
          />
          <FormEquipamentRole
            role="INVERTER"
            isPending={isPending}
            fields={fields}
            icon={EthernetPort}
            onAdd={(equipament) => append(equipament)}
            onRemove={(index) => remove(index)}
          />
        </div>
        <Button type="submit" className="sm:w-fit w-full" disabled={isPending}>
          Salvar
        </Button>
      </form>
    </Form>
  )
}

const FormEquipamentRole = ({
  role,
  isPending,
  fields,
  icon: Icon,
  onAdd,
  onRemove,
}: {
  role: EquipamentRole
  isPending: boolean
  fields: any[]
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  onAdd: (equipament: EquipamentItemFormValues) => void
  onRemove: (index: number) => void
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

  const roleEquipaments = fields.filter((field) => {
    const equipament = equipamentsQuery.data?.find(
      (eq) => eq.id === field.equipamentId,
    )
    return equipament?.role === role
  })

  const options: FilterOptionsProps = roleEquipaments.map((field) => {
    const equipament = equipamentsQuery.data?.find(
      (eq) => eq.id === field.equipamentId,
    )
    return {
      label: equipament?.name || '',
      value: field.equipamentId,
      quantity: field.quantity,
      index: fields.findIndex((f) => f.id === field.id),
    }
  })

  const handleAddEquipament = form.handleSubmit((values) => {
    onAdd(values)
    form.reset()
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="grid sm:grid-cols-2 xl:flex items-end gap-2">
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
        <Button
          type="button"
          className="w-fit"
          onClick={handleAddEquipament}
          disabled={!form.formState.isValid}
        >
          <Plus className="mr-2" />
          Adicionar {translateEquipamentRole(role)}
        </Button>
      </div>
      <CardData
        title={translateEquipamentRole(role)}
        description={`Veja aqui todos os ${translateEquipamentRole(role)} desta obra`}
        icon={Icon}
        disabled={isPending}
        options={options}
        onRemove={onRemove}
      />
    </div>
  )
}

const CardData = ({
  title,
  description,
  icon: Icon,
  disabled,
  options,
  onRemove,
}: {
  title: string
  description: string
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  disabled?: boolean
  options: (FilterOptionsProps[0] & { quantity?: number; index?: number })[]
  onRemove: (index: number) => void
}) => {
  return (
    <Card className="flex flex-col gap-2 p-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-[0.8rem] text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {options && !!options.length ? (
          <div className="flex items-center flex-wrap gap-2">
            {options.map((option) => (
              <div
                key={option.value}
                className="group flex items-center gap-1 relative rounded-md text-sm font-medium transition-colors focus-visible:outline-none border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                <div className="group-hover:flex hidden transition-all duration-500 items-center gap-1 absolute top-0 right-0 bg-white/50 p-1 rounded-md">
                  <span
                    title="Remover"
                    className={cn(
                      'cursor-pointer text-black',
                      disabled && 'cursor-not-allowed',
                    )}
                    onClick={() => {
                      if (!disabled && typeof option.index === 'number') {
                        onRemove(option.index)
                      }
                    }}
                  >
                    <CircleX size={16} />
                  </span>
                </div>
                <Icon size={16} />
                <span className="text-xs text-muted-foreground">
                  {option.quantity || 0} unids: {option.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            Nenhum registro cadastrado
          </span>
        )}
      </CardContent>
    </Card>
  )
}
