import { z } from 'zod'

export const insertTeamInWorkSchema = z.object({
  teams: z.array(z.string().min(1, { message: 'Colaborador é obrigatório' })),
})

export type InsertTeamInWorkFormValues = z.infer<typeof insertTeamInWorkSchema>

export const insertTeamInWorkDefaultValues: InsertTeamInWorkFormValues = {
  teams: [],
}
