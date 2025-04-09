import { Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useGetTeams } from '@/features/teams/api/use-get-teams'
import { useNewTeam } from '@/features/teams/hooks/use-new-team'

import {
  InsertTeamInWorkFormValues,
  insertTeamInWorkSchema,
} from '@/features/works/teams/schema'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { CardData } from '@/components/card-data'
import { SelectCreate } from '@/components/select-create'

type Props = {
  isPending: boolean
  defaultValues: InsertTeamInWorkFormValues
  onSubmit: (values: InsertTeamInWorkFormValues) => void
}

export const FormWorkTeam = ({ isPending, defaultValues, onSubmit }: Props) => {
  const { onOpen: onOpenNewTeam } = useNewTeam()

  const form = useForm<InsertTeamInWorkFormValues>({
    resolver: zodResolver(insertTeamInWorkSchema),
    defaultValues,
    shouldFocusError: true,
    reValidateMode: 'onChange',
    mode: 'all',
  })

  const watchTeams = form.watch('teams')

  const teamsQuery = useGetTeams()
  const teamsOptions = (teamsQuery.data ?? []).map((team) => ({
    label: team.name,
    value: team.id,
  }))
  const isLoadingTeams = teamsQuery.isLoading
  const onCreateTeam = () => onOpenNewTeam()
  const teamOptions = watchTeams
    ? teamsOptions.filter((team) => !watchTeams.includes(team.value))
    : teamsOptions

  const handleSubmit = (values: InsertTeamInWorkFormValues) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          name="teams"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel htmlFor="teams">Equipe</FormLabel>
              <FormControl>
                <SelectCreate
                  id="teams"
                  placeholder="Equipe"
                  options={teamOptions}
                  onCreate={onCreateTeam}
                  value={''}
                  onChange={(team) => {
                    const values = field.value
                    const newValues = values ? values.concat(team!) : [team]
                    field.onChange(newValues)
                  }}
                  disabled={isPending}
                  isLoading={isLoadingTeams}
                />
              </FormControl>
              <FormMessage />
              <CardData
                title="Equipes"
                description="Veja aqui todos as equipes desta obra"
                values={field.value}
                icon={Users}
                disabled={isPending}
                options={teamsOptions}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
        <Button className="sm:w-fit w-full" disabled={isPending}>
          Salvar
        </Button>
      </form>
    </Form>
  )
}
