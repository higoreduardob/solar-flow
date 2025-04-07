'use client'

import { columns } from '@/app/plataforma/(protected)/(plataform)/obras/(work)/_features/columns'

import { useFilterWork } from '@/features/works/hooks/use-filter-work'
import { useGetWorks } from '@/features/works/api/use-get-works'
import { useBulkDeleteWorks } from '@/features/works/api/use-bulk-delete-works'

import { Skeleton } from '@/components/ui/skeleton'
import { TitleProtected as Title } from '@/components/title-custom'
import { DataTable, DataTableLoading } from '@/components/data-table'
import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/(work)/_components/actions'

export default function WorkPage() {
  const { onChangeStatus, status } = useFilterWork()

  const worksQuery = useGetWorks()
  const works = worksQuery.data || []
  const deleteWorks = useBulkDeleteWorks()

  const isLoading = worksQuery.isLoading || deleteWorks.isPending

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
        <Title>Obras</Title>
        <DataTable
          filterKey="customer"
          placeholder="cliente"
          columns={columns}
          data={works}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id)
            deleteWorks.mutate({ ids })
          }}
          status={status}
          onChangeStatus={onChangeStatus}
          filters={<Actions />}
        />
      </div>
    </section>
  )
}
