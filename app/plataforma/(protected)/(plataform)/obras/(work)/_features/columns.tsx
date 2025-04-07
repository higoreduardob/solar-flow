'use client'

import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { WorkRole } from '@prisma/client'

import { client } from '@/lib/hono'
import { translateWorkRole } from '@/lib/i18n'
import { cn, formatCurrency } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/(work)/_features/actions'

export function styleWorkRole(role: WorkRole) {
  switch (role) {
    case 'CANCELLED':
      return 'text-red-500'
    case 'COMPLETED':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
}

export type ResponseType = InferResponseType<
  typeof client.api.works.$get,
  200
>['data'][0]

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
    accessorKey: 'customer',
    enableHiding: false,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.customer.name,
  },
  {
    accessorKey: 'whatsApp',
    header: () => {
      return <Button variant="ghost">WhatsApp</Button>
    },
    cell: ({ row }) => row.original.customer.whatsApp,
  },
  {
    accessorKey: 'valor',
    header: () => {
      return <Button variant="ghost">Valor da obra</Button>
    },
    cell: ({ row }) => <span>{formatCurrency(row.original.amount)}</span>,
  },
  // TODO: Add summary
  {
    accessorKey: 'situação',
    header: () => {
      return <Button variant="ghost">Situação</Button>
    },
    cell: ({ row }) => (
      <span className={cn('uppercase', styleWorkRole(row.original.role))}>
        {translateWorkRole(row.original.role)}
      </span>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <Actions
        role={row.original.role}
        status={row.original.status}
        id={row.original.id}
      />
    ),
  },
]
