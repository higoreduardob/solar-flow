'use client'

import { columns } from '@/app/plataforma/(protected)/(plataform)/obras/equipamentos/_features/columns'

import { useGetEquipaments } from '@/features/equipaments/api/use-get-equipaments'
import { useFilterEquipament } from '@/features/equipaments/hooks/use-filter-equipament'
import { useBulkDeleteEquipaments } from '@/features/equipaments/api/use-bulk-delete-equipaments'

import { Skeleton } from '@/components/ui/skeleton'
import { TitleProtected as Title } from '@/components/title-custom'
import { DataTable, DataTableLoading } from '@/components/data-table'
import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/equipamentos/_components/actions'

export default function EquipamentPage() {
  const equipamentsQuery = useGetEquipaments()
  const equipaments = equipamentsQuery.data || []
  const deleteEquipaments = useBulkDeleteEquipaments()

  const { onChangeStatus, status } = useFilterEquipament()

  const isLoading = equipamentsQuery.isLoading || deleteEquipaments.isPending

  if (isLoading) {
    return (
      <section>
        <div className="w-full flex flex-col gap-4">
          <Skeleton className="h-[30px] w-[300px]" />
          <DataTableLoading />
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <Title>Equipamentos</Title>
        <DataTable
          filterKey="name"
          placeholder="equipamento"
          columns={columns}
          data={equipaments}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id)
            deleteEquipaments.mutate({ ids })
          }}
          status={status}
          onChangeStatus={onChangeStatus}
          filters={<Actions />}
        />
      </div>
    </section>
  )
}
