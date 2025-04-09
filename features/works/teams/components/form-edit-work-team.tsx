import { InsertTeamInWorkFormValues } from '@/features/works/teams/schema'

import { useGetWorkTeams } from '@/features/works/teams/api/use-get-work-teams'
import { useEditWorkTeams } from '@/features/works/teams/api/use-edit-work-teams'

import { Loader } from '@/components/loader'
import { FormWorkTeam } from '@/features/works/teams/components/form-work-team'

type Props = {
  workId: string
}

export const FormEditWorkTeam = ({ workId }: Props) => {
  const teamsQuery = useGetWorkTeams(workId)
  const editMutation = useEditWorkTeams(workId)

  const isLoading = teamsQuery.isLoading

  if (isLoading) {
    return <Loader />
  }

  const isPending = editMutation.isPending

  const { data } = teamsQuery

  if (!data) return null

  const isNonInProgress = data.role !== 'INPROGRESS'

  const defaultValues: InsertTeamInWorkFormValues = {
    teams: data.teams,
  }

  const onSubmit = async (values: InsertTeamInWorkFormValues) => {
    if (isNonInProgress) return

    editMutation.mutate(values)
  }

  return (
    <FormWorkTeam
      isPending={isPending || isNonInProgress}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />
  )
}
