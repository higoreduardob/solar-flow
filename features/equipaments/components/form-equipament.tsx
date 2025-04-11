import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { EquipamentRole } from '@prisma/client'

import {
  insertEquipamentFormSchema,
  InsertEquipamentFormValues,
} from '@/features/equipaments/schema'

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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { InputFile } from '@/components/input-file'
import { FormDialog } from '@/components/form-dialog'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type Props = {
  id?: string
  isOpen: boolean
  isPending: boolean
  status?: boolean
  defaultValues: InsertEquipamentFormValues
  onDelete?: () => void
  handleClose: () => void
  onSubmit: (values: InsertEquipamentFormValues) => void
}

export const FormEquipament = ({
  id,
  isOpen,
  isPending,
  status,
  defaultValues,
  onDelete,
  handleClose,
  onSubmit,
}: Props) => {
  const form = useForm<InsertEquipamentFormValues>({
    resolver: zodResolver(insertEquipamentFormSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const watchRole = form.watch('role')
  const isPlate = watchRole === 'PLATE'

  const handleSubmit = (values: InsertEquipamentFormValues) => {
    onSubmit(values)
  }

  useEffect(() => {
    form.reset()
  }, [isOpen])

  useEffect(() => {
    form.clearErrors()

    const defaultValuesForRole = {
      [EquipamentRole.PLATE]: {
        circuitBreaker: null,
        mppt: null,
        quantityString: null,
      },
      [EquipamentRole.INVERTER]: {
        voc: null,
        isc: null,
        vmp: null,
        imp: null,
      },
    }

    form.reset({
      ...form.getValues(),
      ...defaultValuesForRole[watchRole],
    })
  }, [watchRole, form])

  return (
    <FormDialog
      id={id}
      formId="form-equipament"
      title={id ? 'Editar equipamento' : 'Novo equipamento'}
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
          id="form-equipament"
          className="flex flex-col gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tipo de equipamento</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center gap-3"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value={EquipamentRole.PLATE}
                          disabled={!!id}
                          className="hidden"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        <Badge variant={isPlate ? 'default' : 'outline'}>
                          Módulo
                        </Badge>
                      </FormLabel>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem
                          value={EquipamentRole.INVERTER}
                          disabled={!!id}
                          className="hidden"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        <Badge variant={isPlate ? 'outline' : 'default'}>
                          Inversor
                        </Badge>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
                <FormDescription className="!line-clamp-1">
                  Informe o tipo do equipamento
                </FormDescription>
              </FormItem>
            )}
          />
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
                      placeholder="Nome do equipamento"
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
                      placeholder="Fabricante do equipamento"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="power"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Potência</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ''}
                      disabled={isPending}
                      placeholder="Potência do equipamento"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <>
              <FormField
                control={form.control}
                name="voc"
                render={({ field }) => (
                  <FormItem className={cn('w-full', !isPlate && 'hidden')}>
                    <FormLabel>Open circuit voltage (Voc)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Voc do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isc"
                render={({ field }) => (
                  <FormItem className={cn('w-full', !isPlate && 'hidden')}>
                    <FormLabel>Short circuit current (Isc)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Isc do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vmp"
                render={({ field }) => (
                  <FormItem className={cn('w-full', !isPlate && 'hidden')}>
                    <FormLabel>Maximum power voltage (Vmp)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Vmp do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imp"
                render={({ field }) => (
                  <FormItem className={cn('w-full', !isPlate && 'hidden')}>
                    <FormLabel>Maximum power current (Imp)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Imp do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
            <>
              <FormField
                control={form.control}
                name="circuitBreaker"
                render={({ field }) => (
                  <FormItem className={cn('w-full', isPlate && 'hidden')}>
                    <FormLabel>Disjuntor de segurança</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Disjuntor de segurança do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mppt"
                render={({ field }) => (
                  <FormItem className={cn('w-full', isPlate && 'hidden')}>
                    <FormLabel>Quantidade de entrada</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Quantidade de entrada do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantityString"
                render={({ field }) => (
                  <FormItem className={cn('w-full', isPlate && 'hidden')}>
                    <FormLabel>Quantidade de string</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ''}
                        disabled={isPending}
                        placeholder="Quantidade de string do equipamento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
            <FormField
              control={form.control}
              name="inmetro"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="inmetro">Inmetro</FormLabel>
                  <FormControl>
                    <InputFile
                      id="inmetro"
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
            <FormField
              control={form.control}
              name="datasheet"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel htmlFor="datasheet">Datasheet</FormLabel>
                  <FormControl>
                    <InputFile
                      id="datasheet"
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
