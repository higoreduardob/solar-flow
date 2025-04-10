import { z } from 'zod'

import {
  insertDocumentSchema,
  insertFileOrDocumentSchema,
} from '@/features/common/schema'

export const insertDocumentInWorkSchema = z.object({
  documents: z.array(insertDocumentSchema).nullish(),
})

export const insertDocumentInWorkFormSchema = insertDocumentInWorkSchema.extend(
  {
    documents: z.array(insertFileOrDocumentSchema).nullish(),
  },
)

export type InsertDocumentInWorkSchema = z.infer<
  typeof insertDocumentInWorkSchema
>

export type InsertDocumentInWorkFormValues = z.infer<
  typeof insertDocumentInWorkFormSchema
>

export const insertDocumentInWorkDefaultValues: InsertDocumentInWorkFormValues =
  {
    documents: null,
  }
