import { z } from 'zod'

export const insertMaterialInWorkSchema = z.object({
  materialId: z.string().min(1, { message: 'Material é obrigatório' }),
  amount: z.coerce.number({ invalid_type_error: 'Valor é obrigatório' }),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantitdade é obrigatório' })
    .positive({ message: 'Quantitdade é obrigatório' }),
})

export const insertMaterialInWorkFormSchema = insertMaterialInWorkSchema.extend(
  {
    amount: z.string().min(1, { message: 'Valor é obrigatório' }),
  },
)

export type InsertMaterialInWorkSchema = z.infer<
  typeof insertMaterialInWorkSchema
>

export type InsertMaterialInWorkFormValues = z.infer<
  typeof insertMaterialInWorkFormSchema
>

export const insertMaterailInWorkDefaultValues: InsertMaterialInWorkFormValues =
  {
    materialId: '',
    amount: '',
    quantity: 0,
  }
