import { WorkRole } from '@prisma/client'

import {
  columns,
  ResponseType,
} from '@/features/works/materials/resources/columns'

import { useGetWorkMaterials } from '@/features/works/materials/api/use-get-work-materials'
import { useNewWorkMaterial } from '@/features/works/materials/hooks/use-new-work-material'
import { useBulkDeleteTransactions } from '@/features/works/transactions/api/use-bulk-delete-transactions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, DataTableLoading } from '@/components/data-table'
import { SubTitleProtected as SubTitle } from '@/components/title-custom'

export const TableMaterial = ({ workId }: { workId: string }) => {
  const materialsQuery = useGetWorkMaterials(workId)
  const material = materialsQuery.data

  const isLoading = materialsQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-transparent">
          <CardContent>
            <DataTableLoading />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!material) return null
  const { materials, role } = material

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 bg-transparent">
        <SubTitle>Materiais</SubTitle>
        <CardContent>
          <Table materials={materials} workId={workId} role={role} />
        </CardContent>
      </Card>
    </div>
  )
}

const Table = ({
  materials,
  workId,
  role,
}: {
  materials: ResponseType[]
  workId: string
  role: WorkRole
}) => {
  const { onOpen } = useNewWorkMaterial()

  const deleteTransactions = useBulkDeleteTransactions()

  const isLoading = deleteTransactions.isPending

  const isNonInProgress = role !== 'INPROGRESS'

  return (
    <DataTable
      filterKey="name"
      placeholder="material"
      columns={columns}
      data={materials}
      disabled={isNonInProgress}
      isNonExportable
      isFilter={false}
      onDelete={(row) => {
        const ids = row.map((r) => r.original.materialId)
        deleteTransactions.mutate({ ids })
      }}
      filters={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen(workId)}
            disabled={isNonInProgress || isLoading}
          >
            Adicionar
          </Button>
        </div>
      }
    />
  )
}
