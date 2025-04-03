import { z } from 'zod'

import { UserRole } from '@prisma/client'

import {
  addressDefaultValues,
  addressSchema,
  cpfCnpjSchema,
  passwordSchema,
  whatsAppSchema,
} from '@/features/common/schema'

export const signUpSchema = z
  .object({
    name: z
      .string({ message: 'Nome é obrigatório' })
      .min(1, { message: 'Nome é obrigatório' }),
    email: z.coerce
      .string({ message: 'Email é obrigatório' })
      .email({ message: 'Informe um email válido' }),
    password: passwordSchema,
    repeatPassword: z
      .string({ message: 'Repetir senha é obrigatório' })
      .min(1, { message: 'Repetir senha é obrigatório' }),
    whatsApp: whatsAppSchema,
    cpfCnpj: cpfCnpjSchema,
    role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
    hasAcceptedTerms: z.boolean().refine((value) => value, {
      message: 'Os termos de uso devem ser aceitos',
    }),
    address: addressSchema,
  })
  .refine(
    (data) => {
      if (data.password !== data.repeatPassword) return false
      return true
    },
    {
      message: 'Repetir deve ser igual a senha',
      path: ['repeatPassword'],
    },
  )

export type SignUpFormValues = z.infer<typeof signUpSchema>

export const signUpDefaultValues: SignUpFormValues = {
  email: '',
  name: '',
  password: '',
  repeatPassword: '',
  whatsApp: '',
  cpfCnpj: '',
  role: UserRole.OWNER,
  hasAcceptedTerms: false,
  address: addressDefaultValues,
}

export const signInSchema = z.object({
  email: z.coerce
    .string({ message: 'Email é obrigatório' })
    .email({ message: 'Informe um email válido' }),
  password: z
    .string({ message: 'Senha é obrigatório' })
    .min(1, { message: 'Senha é obrigatório' }),
  role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
  code: z.string({ invalid_type_error: 'Informe um código válido' }).nullish(),
})

export type SignInFormValues = z.infer<typeof signInSchema>

export const signInDefaultValues: SignInFormValues = {
  email: '',
  password: '',
  role: UserRole.OWNER,
  code: '',
}

export const updateSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  whatsApp: whatsAppSchema,
  cpfCnpj: cpfCnpjSchema,
  role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
  address: addressSchema,
})

export type UpdateFormValues = z.infer<typeof updateSchema>

export const forgotPasswordSchema = z.object({
  email: z.coerce
    .string({ message: 'Email é obrigatório' })
    .email({ message: 'Informe um email válido' }),
  role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const forgotPasswordDefaultValues: ForgotPasswordFormValues = {
  email: '',
  role: UserRole.OWNER,
}

export const resetPasswordSchema = z
  .object({
    password: z
      .string({ message: 'Senha é obrigatório' })
      .min(6, { message: 'Mínimo 6 caracteres' }),
    repeatPassword: z
      .string({ message: 'Repetir senha é obrigatório' })
      .min(1, { message: 'Repetir senha é obrigatório' }),
    role: z.nativeEnum(UserRole, { message: 'Privilégio é obrigatório' }),
  })
  .refine(
    (data) => {
      if (data.password !== data.repeatPassword) return false
      return true
    },
    {
      message: 'Repetir deve ser igual a senha',
      path: ['repeatPassword'],
    },
  )

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const resetPasswordDefaultValues: ResetPasswordFormValues = {
  password: '',
  repeatPassword: '',
  role: UserRole.OWNER,
}
