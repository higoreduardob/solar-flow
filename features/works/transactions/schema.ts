import { z } from 'zod'

import {
  insertDocumentSchema,
  insertFileOrDocumentSchema,
} from '@/features/common/schema'

export const insertTransactionSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  amount: z.coerce.number({
    invalid_type_error: 'Valor da obra é obrigatório',
  }),
  documents: z.array(insertDocumentSchema).nullish(),
})

export const insertTransactionFormSchema = insertTransactionSchema.extend({
  amount: z
    .string({ message: 'Valor da obra é obrigatório' })
    .min(1, { message: 'Valor da obra é obrigatório' }),
  documents: z.array(insertFileOrDocumentSchema).nullish(),
})

export type InsertTransactionSchema = z.infer<typeof insertTransactionSchema>

export type InsertTransactionFormValues = z.infer<
  typeof insertTransactionFormSchema
>

export const insertTransactionDefaultValues: InsertTransactionFormValues = {
  name: '',
  amount: '',
  documents: null,
}
