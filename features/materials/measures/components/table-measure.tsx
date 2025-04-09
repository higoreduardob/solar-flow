import { columns } from '@/features/materials/measures/resources/columns'

import { useNewMeasure } from '@/features/materials/measures/hooks/use-new-measure'
import { useGetMeasures } from '@/features/materials/measures/api/use-get-measures'
import { useOpenMeasureData } from '@/features/materials/measures/hooks/use-open-measure'
import { useFilterMeasure } from '@/features/materials/measures/hooks/use-filter-measure'
import { useBulkDeleteMeasures } from '@/features/materials/measures/api/use-bulk-delete-measures'

import { Button } from '@/components/ui/button'
import { ContentDialog } from '@/components/content-dialog'
import { DataTable, DataTableLoading } from '@/components/data-table'

export const TableMeasure = () => {
  const { onOpen } = useNewMeasure()
  const { isOpen, onClose } = useOpenMeasureData()
  const { onChangeStatus, status } = useFilterMeasure()
  const measuresQuery = useGetMeasures()
  const measures = measuresQuery.data || []
  const deleteCategories = useBulkDeleteMeasures()

  const isLoading = measuresQuery.isLoading || deleteCategories.isPending

  if (isLoading) {
    return (
      <ContentDialog
        title="Unidades"
        description="Todos unidades cadastradas no sistema"
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
      title="Unidades"
      description="Todas unidades cadastradas no sistema"
      isOpen={isOpen}
      handleClose={onClose}
      className="max-w-[90%] xl:max-w-screen-lg"
    >
      <DataTable
        filterKey="name"
        placeholder="unidade"
        columns={columns}
        data={measures}
        isNonExportable
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id)
          deleteCategories.mutate({ ids })
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
