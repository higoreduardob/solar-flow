'use client'

import { columns } from '@/app/gestao/(protected)/(manager)/empresas/_features/columns'

import { useGetEnterprises } from '@/features/manager/api/use-get-enterprises'

import { Skeleton } from '@/components/ui/skeleton'
import { TitleProtected as Title } from '@/components/title-custom'
import { DataTable, DataTableLoading } from '@/components/data-table'

export default function UserPage() {
  const enterprisesQuery = useGetEnterprises()
  const enterprises = enterprisesQuery.data || []

  const isLoading = enterprisesQuery.isLoading

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
        <Title>Empresas</Title>
        <DataTable
          filterKey="name"
          placeholder="empresa"
          columns={columns}
          data={enterprises}
          isFilter={false}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id)
            console.log({ ids })
          }}
        />
      </div>
    </section>
  )
}
