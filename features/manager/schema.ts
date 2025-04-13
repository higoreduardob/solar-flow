import { z } from 'zod'

export const insertOwnerSchema = z.object({
  owners: z
    .array(z.string().min(1, { message: 'Proprietário é obrigatório' }))
    .min(1, { message: 'Proprietário é obrigatório' }),
})

export type InsertOwnerFormValues = z.infer<typeof insertOwnerSchema>
