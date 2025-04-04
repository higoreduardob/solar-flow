'use client'

import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { client } from '@/lib/hono'
import { formatCurrency } from '@/lib/utils'

import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/almoxarifado/_features/actions'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export type ResponseType = InferResponseType<
  typeof client.api.materials.$get,
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
  },
  {
    accessorKey: 'fornecedor',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fornecedor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.supplier,
  },
  {
    accessorKey: 'preço',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Preço
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'estoque',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <p>
        {row.original.stock}{' '}
        <span className="text-zinc-500">{row.original.measure?.name}</span>
      </p>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <Actions status={row.original.status} id={row.original.id} />
    ),
  },
]
