'use client'

import { columns } from '@/app/gestao/(protected)/(manager)/usuarios/_features/columns'

import { useGetUsers } from '@/features/manager/api/use-get-users'
import { useFilterUser } from '@/features/users/hooks/use-filter-user'
import { useBulkDeleteUsers } from '@/features/manager/api/use-bulk-delete-users'

import { Skeleton } from '@/components/ui/skeleton'
import { TitleProtected as Title } from '@/components/title-custom'
import { DataTable, DataTableLoading } from '@/components/data-table'
import { Actions } from '@/app/gestao/(protected)/(manager)/usuarios/_components/actions'

export default function UserPage() {
  const usersQuery = useGetUsers()
  const users = usersQuery.data || []
  const deleteUsers = useBulkDeleteUsers()

  const { onChangeStatus, status } = useFilterUser()

  const isLoading = usersQuery.isLoading || deleteUsers.isPending

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
        <Title>Clientes</Title>
        <DataTable
          filterKey="name"
          placeholder="usuários"
          columns={columns}
          data={users}
          status={status}
          onDelete={(row) => {
            const ids = row.map((r) => r.original.id)
            deleteUsers.mutate({ ids })
          }}
          onChangeStatus={onChangeStatus}
          filters={<Actions />}
        />
      </div>
    </section>
  )
}
