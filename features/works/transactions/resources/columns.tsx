'use client'

import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { client } from '@/lib/hono'

import { Actions } from '@/features/works/transactions/resources/actions'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatValue } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ResponseType = InferResponseType<
  (typeof client.api)['transactions']['works'][':workId']['$get'],
  200
>['data']['incomes'][0]

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    enableHiding: false,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Identificação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'valor',
    header: () => {
      return <Button variant="ghost">Valor</Button>
    },
    cell: ({ row }) =>
      formatValue(row.original.amount, {
        isCurrency: true,
        fractionDigits: 2,
      }),
  },
  {
    accessorKey: 'data',
    header: () => {
      return <Button variant="ghost">Data</Button>
    },
    cell: ({ row }) =>
      format(row.original.createdAt, 'dd MMMM yyyy', {
        locale: ptBR,
      }),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <Actions
        workId={row.original.workId}
        isExpenses={row.original.amount < 0}
        role={row.original.work.role}
        id={row.original.id}
      />
    ),
  },
]
