import { z } from 'zod'

import { removeMask } from '@/lib/format'
import { validateCNPJ, validateCPF } from '@/lib/validate'
import { AllowedMimeTypes, MaxFileSize } from '@/constants'

export const whatsAppSchema = z
  .string({ message: 'WhatsApp é obrigatório' })
  .min(1, { message: 'WhatsApp é obrigatório' })
  .transform((value) => removeMask(value))
  .refine((value) => /^\d{10,11}$/.test(value), {
    message: 'WhatsApp deve conter entre 10 e 11 dígitos numéricos',
  })

export const passwordSchema = z
  .string({ message: 'Senha é obrigatória' })
  .min(6, { message: 'Mínimo 6 caracteres' })
  .refine(
    (password) => {
      let strength = 0
      if (password.length >= 6) strength += 25
      if (password.match(/[A-Z]/)) strength += 25
      if (password.match(/[0-9]/)) strength += 25
      if (password.match(/[^A-Za-z0-9]/)) strength += 25
      return strength >= 75
    },
    {
      message:
        'A senha deve conter pelo menos 6 caracteres, incluindo maiúsculas, números e símbolos',
    },
  )

export const cpfCnpjSchema = z
  .string()
  .transform((value) => removeMask(value))
  .refine((value) => value === '' || /^\d{11,14}$/.test(value), {
    message: 'CPF/CNPJ deve conter entre 11 e 14 dígitos numéricos',
  })
  .refine(
    (value) => {
      if (!value) return true

      const digits = value.replace(/\D/g, '').length
      if (digits === 11) return validateCPF(value)
      return validateCNPJ(value)
    },
    { message: 'Documento inválido' },
  )

export const addressSchema = z.object({
  street: z
    .string({ message: 'Rua é obrigatório' })
    .min(1, { message: 'Rua é obrigatório' }),
  neighborhood: z
    .string({ message: 'Bairro é obrigatório' })
    .min(1, { message: 'Bairro é obrigatório' }),
  city: z
    .string({ message: 'Cidade é obrigatório' })
    .min(1, { message: 'Cidade é obrigatório' }),
  state: z
    .string({ message: 'Estado é obrigatório' })
    .length(2, { message: 'Somente as siglas do Estado' }),
  number: z.string().nullish(),
  zipCode: z
    .string({ message: 'Informe um CEP válido' })
    .transform((value) => removeMask(value))
    .refine((value) => /^\d{8}$/.test(value), {
      message: 'CEP deve contrer 8 dígitos numéricos',
    }),
  complement: z.string().nullish(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export const addressDefaultValues: AddressFormValues = {
  city: '',
  neighborhood: '',
  state: '',
  street: '',
  zipCode: '',
  complement: '',
  number: '',
}

export const insertDocumentSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  url: z
    .string({ message: 'Url é obrigatório' })
    .min(1, { message: 'Url é obrigatório' }),
  publicId: z
    .string({ message: 'Identificador é obrigatório' })
    .min(1, { message: 'Identificador é obrigatório' }),
  type: z
    .string({ message: 'Formato é obrigatório' })
    .min(1, { message: 'Formato é obrigatório' }),
  size: z
    .string({ message: 'Tamanho é obrigatório' })
    .min(1, { message: 'Formato é obrigatório' }),
})

export type InsertDocumentFormValues = z.infer<typeof insertDocumentSchema>

export const insertFileOrDocumentSchema = z
  .union([z.instanceof(File), insertDocumentSchema])
  .refine(
    (value) =>
      value === null || value instanceof File || typeof value === 'object',
  )

export type InsertFileOrDocumentFormValues = z.infer<
  typeof insertFileOrDocumentSchema
>

export const insertFileOrDocumentDefaultValues = {
  name: '',
  url: '',
  publicId: '',
  type: '',
  size: '',
}

export const insertFileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Arquivo inválido' })
    .refine(
      (file) => file.size <= MaxFileSize,
      'Arquivo muito pesado (máx 512kB)',
    )
    .refine(
      (file) => AllowedMimeTypes.includes(file.type),
      'Tipo de arquivo não suportado',
    ),
})

export const insertMultipleFileSchema = z.object({
  files: z.array(
    z
      .instanceof(File, { message: 'Arquivo inválido' })
      .refine(
        (file) => file.size <= MaxFileSize,
        'Arquivo muito pesado (máx 512kB)',
      )
      .refine(
        (file) => AllowedMimeTypes.includes(file.type),
        'Tipo de arquivo não suportado',
      ),
  ),
})
