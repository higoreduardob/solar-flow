import { columns } from '@/features/teams/resources/columns'

import { useNewTeam } from '@/features/teams/hooks/use-new-team'
import { useGetTeams } from '@/features/teams/api/use-get-teams'
import { useOpenTeamData } from '@/features/teams/hooks/use-open-team'
import { useFilterTeam } from '@/features/teams/hooks/use-filter-team'
import { useBulkDeleteTeams } from '@/features/teams/api/use-bulk-delete-teams'

import { Button } from '@/components/ui/button'
import { ContentDialog } from '@/components/content-dialog'
import { DataTable, DataTableLoading } from '@/components/data-table'

export const TableTeam = () => {
  const { isOpen, onClose } = useOpenTeamData()
  const { onOpen } = useNewTeam()
  const { onChangeStatus, status } = useFilterTeam()
  const teamsQuery = useGetTeams()
  const teams = teamsQuery.data || []
  const deleteTeams = useBulkDeleteTeams()

  const isLoading = teamsQuery.isLoading || deleteTeams.isPending

  if (isLoading) {
    return (
      <ContentDialog
        title="Equipes"
        description="Todos equipes cadastradas no sistema"
        isOpen={isOpen}
        handleClose={onClose}
        className="max-w-[90%] xl:max-w-screen-lg"
      >
        <DataTableLoading />
      </ContentDialog>
    )
  }

  return (
    <ContentDialog
      title="Equipes"
      description="Todas equipes cadastradas no sistema"
      isOpen={isOpen}
      handleClose={onClose}
      className="max-w-[90%] xl:max-w-screen-lg"
    >
      <DataTable
        filterKey="name"
        placeholder="equipe"
        columns={columns}
        data={teams}
        isNonExportable
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id)
          deleteTeams.mutate({ ids })
        }}
        status={status}
        onChangeStatus={onChangeStatus}
        filters={
          <div className="flex items-center gap-2">
            <Button onClick={onOpen}>Adicionar</Button>
          </div>
        }
      />
    </ContentDialog>
  )
}
