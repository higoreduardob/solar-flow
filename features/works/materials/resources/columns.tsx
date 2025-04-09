'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { client } from '@/lib/hono'
import { formatCurrency } from '@/lib/utils'

import { Actions } from '@/features/works/materials/resources/actions'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export type ResponseType = InferResponseType<
  (typeof client.api)['works'][':id']['materials']['$get'],
  200
>['data']['materials'][0]

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
          Material
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    // TODO: Fix this search
    cell: ({ row }) => row.original.material.name,
  },
  {
    accessorKey: 'quantidade',
    header: () => {
      return <Button variant="ghost">Quantidade</Button>
    },
    cell: ({ row }) => (
      <p>
        {row.original.quantity}{' '}
        <span className="text-zinc-500">
          {row.original.material.measure?.name}
        </span>
      </p>
    ),
  },
  {
    accessorKey: 'custo',
    header: () => {
      return <Button variant="ghost">Custo</Button>
    },
    cell: ({ row }) => formatCurrency(row.original.amount),
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
        role={row.original.work.role}
        id={row.original.materialId}
      />
    ),
  },
]
