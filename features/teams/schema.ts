import { z } from 'zod'

export const insertTeamSchema = z.object({
  name: z
    .string({ message: 'Nome é obrigatório' })
    .min(1, { message: 'Nome é obrigatório' }),
  obs: z.string().nullish(),
  employees: z
    .array(z.string().min(1, { message: 'Colaborador é obrigatório' }))
    .min(1, { message: 'Colaborador é obrigatório' }),
})

export type InsertTeamFormValues = z.infer<typeof insertTeamSchema>

export const insertTeamDefaultValues: InsertTeamFormValues = {
  name: '',
  obs: '',
  employees: [],
}
