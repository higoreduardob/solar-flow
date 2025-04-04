import { z } from 'zod'

export const insertMaterialSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  amount: z.coerce.number({ invalid_type_error: 'Valor é obrigatório' }),
  stock: z.coerce
    .number({ invalid_type_error: 'Estoque é obrigatório' })
    .positive({ message: 'Estoque é obrigatório' }),
  supplier: z.string().nullish(),
  obs: z.string().nullish(),
  categoryId: z
    .string({ message: 'Categoria é obrigatório' })
    .min(1, { message: 'Categoria é obrigatório' }),
  measureId: z
    .string({ message: 'Unidade de medida é obrigatório' })
    .min(1, { message: 'Unidade de medida é obrigatório' }),
})

export const insertMaterialFormSchema = insertMaterialSchema.extend({
  amount: z
    .string({ message: 'Valor é obrigatório' })
    .min(1, { message: 'Valor é obrigatório' }),
})

export type InsertMaterialFormValues = z.infer<typeof insertMaterialFormSchema>

export const insertMaterialDefaultValues: InsertMaterialFormValues = {
  name: '',
  amount: '',
  stock: 0,
  supplier: '',
  obs: '',
  categoryId: '',
  measureId: '',
}
