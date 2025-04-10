import { z } from 'zod'

import { addressSchema, insertDocumentSchema } from '@/features/common/schema'

export const insertWorkSchema = z.object({
  amount: z.coerce.number({
    invalid_type_error: 'Valor da obra é obrigatório',
  }),

  circuitBreaker: z.coerce
    .number({
      invalid_type_error: 'Disjuntor geral é obrigatório',
    })
    .nullish(),
  uc: z.string().nullish(),
  isAddressCustomer: z.boolean(),

  coordinates: z.string().nullish(),
  xLat: z.string().nullish(),
  yLat: z.string().nullish(),
  lat: z.string().nullish(),
  long: z.string().nullish(),
  obs: z.string().nullish(),

  orderDate: z.coerce.date().nullish(),
  equipamentArrivalDate: z.coerce.date().nullish(),
  startDateOfWork: z.coerce.date().nullish(),
  approvalDate: z.coerce.date().nullish(),
  deliveryDate: z.coerce.date().nullish(),

  address: addressSchema.nullish(),

  customerId: z
    .string({ message: 'Cliente é obrigatório' })
    .min(1, { message: 'Cliente é obrigatório' }),
  responsibleId: z
    .string({ message: 'Responsável é obrigatório' })
    .min(1, { message: 'Responsável é obrigatório' }),
  designerId: z
    .string({ message: 'Projetista é obrigatório' })
    .min(1, { message: 'Projetista é obrigatório' }),
})

export const insertWorkFormSchema = insertWorkSchema
  .extend({
    amount: z.string().min(1, { message: 'Valor da obra é obrigatório' }),
  })
  .superRefine((data, ctx) => {
    if (!data.isAddressCustomer) {
      const fields = [
        'street',
        'neighborhood',
        'city',
        'state',
        'zipCode',
      ] as const
      for (const field of fields) {
        if (!data.address?.[field]) {
          ctx.addIssue({
            path: ['address', field],
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`,
            code: z.ZodIssueCode.custom,
          })
        }
      }
    }
  })

export type InsertWorkSchema = z.infer<typeof insertWorkSchema>

export type InsertWorkFormValues = z.infer<typeof insertWorkFormSchema>

export const insertWorkDefaultValues: InsertWorkFormValues = {
  amount: '',

  circuitBreaker: null,
  uc: null,
  isAddressCustomer: true,

  coordinates: null,
  xLat: null,
  yLat: null,
  lat: null,
  long: null,
  obs: null,

  orderDate: null,
  equipamentArrivalDate: null,
  startDateOfWork: null,
  approvalDate: null,
  deliveryDate: null,

  address: null,

  customerId: '',
  responsibleId: '',
  designerId: '',
}
