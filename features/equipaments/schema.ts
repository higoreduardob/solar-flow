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
  .refine(
    (data) => {
      if (data.role === EquipamentRole.PLATE && !data.voc) return false
      return true
    },
    {
      message: 'Open circuit voltage é obrigatório',
      path: ['voc'],
    },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.PLATE && !data.isc) return false
      return true
    },
    {
      message: 'Short circuit current é obrigatório',
      path: ['isc'],
    },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.PLATE && !data.vmp) return false
      return true
    },
    {
      message: 'Maximum power voltage é obrigatório',
      path: ['vmp'],
    },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.PLATE && !data.imp) return false
      return true
    },
    {
      message: 'Maximum power current é obrigatório',
      path: ['imp'],
    },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.INVERTER && !data.circuitBreaker)
        return false
      return true
    },
    {
      message: 'Disjuntor de segurança é obrigatório',
      path: ['circuitBreaker'],
    },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.INVERTER && !data.mppt) return false
      return true
    },
    { message: 'Quantidade de entrada é obrigatório', path: ['mppt'] },
  )
  .refine(
    (data) => {
      if (data.role === EquipamentRole.INVERTER && !data.quantityString)
        return false
      return true
    },
    { message: 'Quantidade de string é obrigatório', path: ['quantityString'] },
  )

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
