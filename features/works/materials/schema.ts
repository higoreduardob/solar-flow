import { z } from 'zod'

const materialItemSchema = z.object({
  materialId: z.string().min(1, { message: 'Material é obrigatório' }),
  amount: z.coerce.number({ invalid_type_error: 'Valor é obrigatório' }),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade é obrigatória' })
    .min(1, { message: 'Quantidade deve ser maior que zero' }),
})

export const insertMaterialInWorkSchema = z.object({
  materials: z.array(materialItemSchema),
})

const materialItemFormSchema = materialItemSchema.extend({
  amount: z.string().min(1, { message: 'Valor é obrigatório' }),
})

export const insertMaterialInWorkFormSchema = z.object({
  materials: z.array(materialItemFormSchema),
})

export type InsertMaterialInWorkSchema = z.infer<
  typeof insertMaterialInWorkSchema
>

export type InsertMaterialInWorkFormValues = z.infer<
  typeof insertMaterialInWorkFormSchema
>
