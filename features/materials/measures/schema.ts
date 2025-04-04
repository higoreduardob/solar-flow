import { z } from 'zod'

export const insertMeasureSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
})

export type InsertMeasureFormValues = z.infer<typeof insertMeasureSchema>

export const insertMeasureDefaultValues: InsertMeasureFormValues = {
  name: '',
}
