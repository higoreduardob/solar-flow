import { z } from 'zod'

import { UserRole } from '@prisma/client'

import {
  addressDefaultValues,
  addressSchema,
  cpfCnpjSchema,
  insertDocumentSchema,
  insertFileOrDocumentSchema,
  passwordSchema,
  whatsAppSchema,
} from '@/features/common/schema'

export const insertUserSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  email: z.coerce
    .string({ message: 'Email é obrigatório' })
    .email({ message: 'Informe um email válido' }),
  whatsApp: whatsAppSchema,
  cpfCnpj: cpfCnpjSchema,
  role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
  address: addressSchema,
  status: z.boolean(),

  password: passwordSchema.nullish(),
  repeatPassword: z
    .string({ message: 'Repetir senha é obrigatório' })
    .min(1, { message: 'Repetir senha é obrigatório' })
    .nullish(),
  documents: z.array(insertDocumentSchema).nullish(),
})

export const insertUserFormSchema = insertUserSchema.extend({
  documents: z.array(insertFileOrDocumentSchema).nullish(),
})
// .refine(
//   (data) => {
//     if (data.role !== 'CUSTOMER' && (!data.password || !data.repeatPassword))
//       return false
//     return true
//   },
//   {
//     message: 'Senha é obrigatório',
//     path: ['password'],
//   },
// )
// .refine(
//   (data) => {
//     if (data.role !== 'CUSTOMER' && data.password !== data.repeatPassword)
//       return false
//     return true
//   },
//   {
//     message: 'Repetir deve ser igual a senha',
//     path: ['repeatPassword'],
//   },
// )

export type InsertUserSchema = z.infer<typeof insertUserSchema>

export type InsertUserFormValues = z.infer<typeof insertUserFormSchema>

export const insertUserDefaultValues: InsertUserFormValues = {
  email: '',
  name: '',
  whatsApp: '',
  cpfCnpj: '',
  role: UserRole.EMPLOYEE,
  address: addressDefaultValues,
  status: true,

  password: null,
  repeatPassword: null,
  documents: null,
}
