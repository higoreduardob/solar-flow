import { z } from 'zod'

import { EquipamentRole } from '@prisma/client'

import {
  insertDocumentSchema,
  insertFileOrDocumentSchema,
} from '@/features/common/schema'

export const insertEquipamentSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  supplier: z
    .string({ message: 'Fornecedor é obrigatório' })
    .min(1, { message: 'Fornecedor é obrigatório' }),
  power: z.coerce
    .number({ invalid_type_error: 'Potência é obrigatório' })
    .positive({ message: 'Potência é obrigatório' }),
  role: z.nativeEnum(EquipamentRole, {
    message: 'Tipo do equipamento é obrigatório',
  }),
  obs: z.string().nullish(),

  voc: z.coerce
    .number({ invalid_type_error: 'Open circuit voltage é obrigatório' })
    .nullish(),
  isc: z.coerce
    .number({ invalid_type_error: 'Short circuit current é obrigatório' })
    .nullish(),
  vmp: z.coerce
    .number({ invalid_type_error: 'Maximum power voltage é obrigatório' })
    .nullish(),
  imp: z.coerce
    .number({ invalid_type_error: 'Maximum power current é obrigatório' })
    .nullish(),

  circuitBreaker: z.coerce
    .number({
      invalid_type_error: 'Disjuntor de segurança é obrigatório',
    })
    .nullish(),
  mppt: z.coerce
    .number({
      invalid_type_error: 'Quantidade de entrada é obrigatório',
    })
    .nullish(),
  quantityString: z.coerce
    .number({
      invalid_type_error: 'Quantidade de string é obrigatório',
    })
    .nullish(),

  inmetro: insertDocumentSchema.nullish(),
  datasheet: insertDocumentSchema.nullish(),
})

export const insertEquipamentFormSchema = insertEquipamentSchema
  .extend({
    inmetro: insertFileOrDocumentSchema.nullish(),
    datasheet: insertFileOrDocumentSchema.nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'PLATE') {
      if (!data.voc)
        ctx.addIssue({
          path: ['voc'],
          message: 'Open circuit voltage é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      if (!data.isc)
        ctx.addIssue({
          path: ['isc'],
          message: 'Short circuit current é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      if (!data.vmp)
        ctx.addIssue({
          path: ['vmp'],
          message: 'Maximum power voltage é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      if (!data.imp)
        ctx.addIssue({
          path: ['imp'],
          message: 'Maximum power current é obrigatório',
          code: z.ZodIssueCode.custom,
        })
    }

    if (data.role === 'INVERTER') {
      if (!data.circuitBreaker)
        ctx.addIssue({
          path: ['circuitBreaker'],
          message: 'Disjuntor de segurança é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      if (!data.mppt)
        ctx.addIssue({
          path: ['mppt'],
          message: 'Quantidade de entrada é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      if (!data.quantityString)
        ctx.addIssue({
          path: ['quantityString'],
          message: 'Quantidade de string é obrigatório',
          code: z.ZodIssueCode.custom,
        })
    }
  })

export type InsertEquipamentSchema = z.infer<typeof insertEquipamentSchema>

export type InsertEquipamentFormValues = z.infer<
  typeof insertEquipamentFormSchema
>

export const insertEquipamentDefaultValues: InsertEquipamentFormValues = {
  name: '',
  supplier: '',
  power: 0,
  role: 'PLATE',
  obs: '',

  voc: null,
  isc: null,
  vmp: null,
  imp: null,

  circuitBreaker: null,
  mppt: null,
  quantityString: null,

  inmetro: null,
  datasheet: null,
}
