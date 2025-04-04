import { z } from 'zod'

export const insertCategorySchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
})

export type InsertCategoryFormValues = z.infer<typeof insertCategorySchema>

export const insertCategoryDefaultValues: InsertCategoryFormValues = {
  name: '',
}
