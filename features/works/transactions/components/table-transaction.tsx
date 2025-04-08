import { DollarSign, TrendingDown } from 'lucide-react'

import { WorkRole } from '@prisma/client'

import {
  columns,
  ResponseType,
} from '@/features/works/transactions/resources/columns'

import { useNewTransaction } from '@/features/works/transactions/hooks/use-new-transaction'
import { useGetTransactions } from '@/features/works/transactions/api/use-get-transactions'
import { useBulkDeleteTransactions } from '@/features/works/transactions/api/use-bulk-delete-transactions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, DataTableLoading } from '@/components/data-table'

export const TableTransaction = ({ workId }: { workId: string }) => {
  const transactionsQuery = useGetTransactions(workId)
  const transactions = transactionsQuery.data

  const isLoading = transactionsQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-transparent">
          <CardContent>
            <DataTableLoading />
          </CardContent>
        </Card>
        <Card className="p-4 bg-transparent">
          <CardContent>
            <DataTableLoading />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!transactions) return null
  const { incomes, expenses, role } = transactions

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 bg-transparent">
        <CardContent>
          <Table
            transactions={incomes}
            workId={workId}
            isExpenses={false}
            role={role}
          />
        </CardContent>
      </Card>
      <Card className="p-4 bg-transparent">
        <CardContent>
          <Table
            transactions={expenses}
            workId={workId}
            isExpenses={true}
            role={role}
          />
        </CardContent>
      </Card>
    </div>
  )
}

const Table = ({
  transactions,
  workId,
  isExpenses,
  role,
}: {
  transactions: ResponseType[]
  workId: string
  isExpenses: boolean
  role: WorkRole
}) => {
  const { onOpen } = useNewTransaction()

  const deleteTransactions = useBulkDeleteTransactions()

  const isLoading = deleteTransactions.isPending

  const isNonInProgress = role !== 'INPROGRESS'

  return (
    <DataTable
      filterKey="name"
      placeholder="identificação"
      columns={columns}
      data={transactions}
      isNonExportable
      isFilter={false}
      onDelete={(row) => {
        const ids = row.map((r) => r.original.id)
        deleteTransactions.mutate({ ids })
      }}
      filters={
        <div className="flex items-center gap-2">
          <Button
            variant={isExpenses ? 'destructive' : 'primary'}
            onClick={() => onOpen(workId, isExpenses)}
            disabled={isNonInProgress || isLoading}
          >
            {isExpenses ? (
              <>
                <TrendingDown size={16} className="text-white mr-2" />
                Novo custo
              </>
            ) : (
              <>
                <DollarSign size={16} className="text-white mr-2" />
                Nova entrada
              </>
            )}
          </Button>
        </div>
      }
    />
  )
}
