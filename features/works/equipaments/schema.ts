import { z } from 'zod'

export const equipamentItemSchema = z.object({
  equipamentId: z.string().min(1, { message: 'Equipamento é obrigatório' }),
  quantity: z.coerce
    .number({
      invalid_type_error: 'Quantitdade é obrigatório',
    })
    .min(1, { message: 'Quantidade é obrigatório' }),
})

export const insertEquipamentInWorkSchema = z.object({
  equipaments: z.array(equipamentItemSchema),
})

export type EquipamentItemFormValues = z.infer<typeof equipamentItemSchema>

export type InsertEquipamentInWorkFormValues = z.infer<
  typeof insertEquipamentInWorkSchema
>

export const equipamentItemDefaultValues: EquipamentItemFormValues = {
  equipamentId: '',
  quantity: 0,
}

export const insertEquipamentInWorkDefaultValues: InsertEquipamentInWorkFormValues =
  {
    equipaments: [],
  }

  