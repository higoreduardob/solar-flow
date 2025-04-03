import { z } from 'zod'

import { removeMask } from '@/lib/format'
import { validateCNPJ, validateCPF } from '@/lib/validate'

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
    }
  )

export const cpfCnpjSchema = z
  .string()
  .nullish()
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
    { message: 'Documento inválido' }
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
