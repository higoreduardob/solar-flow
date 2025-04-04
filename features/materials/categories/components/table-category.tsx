import { columns } from '@/features/materials/categories/resources/columns'

import { useGetCategories } from '@/features/materials/categories/api/use-get-categories'
import { useOpenCategoryData } from '@/features/materials/categories/hooks/use-open-category'
import { useFilterCategory } from '@/features/materials/categories/hooks/use-filter-category'
import { useBulkDeleteCategories } from '@/features/materials/categories/api/use-bulk-delete-categories'

import { ContentDialog } from '@/components/content-dialog'
import { DataTable, DataTableLoading } from '@/components/data-table'

export const TableCategory = () => {
  const { isOpen, onClose } = useOpenCategoryData()
  const { onChangeStatus, status } = useFilterCategory()
  const categoriesQuery = useGetCategories()
  const categories = categoriesQuery.data || []
  const deleteCategories = useBulkDeleteCategories()

  const isLoading = categoriesQuery.isLoading || deleteCategories.isPending

  if (isLoading) {
    return (
      <ContentDialog
        title="Categorias"
        description="Todos categorias cadastradas no sistema"
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
      title="Categorias"
      description="Todas categorias cadastradas no sistema"
      isOpen={isOpen}
      handleClose={onClose}
      className="max-w-[90%] xl:max-w-screen-lg"
    >
      <DataTable
        filterKey="name"
        placeholder="categoria"
        columns={columns}
        data={categories}
        isNonExportable
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id)
          deleteCategories.mutate({ ids })
        }}
        status={status}
        onChangeStatus={onChangeStatus}
      />
    </ContentDialog>
  )
}
