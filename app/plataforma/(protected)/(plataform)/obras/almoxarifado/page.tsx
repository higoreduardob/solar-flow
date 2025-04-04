'use client'

import { columns } from '@/app/plataforma/(protected)/(plataform)/obras/almoxarifado/_features/columns'

import { useGetMaterials } from '@/features/materials/api/use-get-materials'
import { useFilterMaterial } from '@/features/materials/hooks/use-filter-material'
import { useBulkDeleteMaterials } from '@/features/materials/api/use-bulk-delete-materials'

import { TitleProtected as Title } from '@/components/title-custom'
import { DataTable, DataTableLoading } from '@/components/data-table'
import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/almoxarifado/_components/actions'

export default function MaterialPage() {
  const materialsQuery = useGetMaterials()
  const materials = materialsQuery.data || []
  const deleteMaterials = useBulkDeleteMaterials()

  const { onChangeStatus, status } = useFilterMaterial()

  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <Title>Produtos</Title>
        <DataTable
          filterKey="name"
          placeholder="material"
          columns={columns}
          data={materials}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id)
            deleteMaterials.mutate({ ids })
          }}
          status={status}
          onChangeStatus={onChangeStatus}
          filters={<Actions />}
        />
      </div>
    </section>
  )
}
