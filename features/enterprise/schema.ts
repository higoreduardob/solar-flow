import { z } from 'zod'

import {
  addressDefaultValues,
  addressSchema,
  cpfCnpjSchema,
  whatsAppSchema,
} from '@/features/common/schema'

export const insertEnterpriseSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  email: z.coerce
    .string({ message: 'Email é obrigatório' })
    .email({ message: 'Informe um email válido' }),
  cpfCnpj: cpfCnpjSchema,
  whatsApp: whatsAppSchema,
  address: addressSchema,
})

export type InsertEnterpriseFormValues = z.infer<typeof insertEnterpriseSchema>

export const insertEnterpriseDefaultValues: InsertEnterpriseFormValues = {
  name: '',
  email: '',
  cpfCnpj: '',
  whatsApp: '',
  address: addressDefaultValues,
}
