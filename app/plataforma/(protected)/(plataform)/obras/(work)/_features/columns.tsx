'use client'

import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { WorkRole } from '@prisma/client'

import { client } from '@/lib/hono'
import { translateWorkRole } from '@/lib/i18n'
import { cn, formatValue } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import { Actions } from '@/app/plataforma/(protected)/(plataform)/obras/(work)/_features/actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function styleWorkRole(role: WorkRole) {
  switch (role) {
    case 'CANCELLED':
      return 'text-red-500'
    case 'COMPLETED':
      return 'text-green-500'
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
    // TODO: Review se código está sendo incrementado para os vários usuários
    accessorKey: 'código',
    header: () => {
      return <Button variant="ghost">Código</Button>
    },
    cell: ({ row }) => row.original.cod,
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
    cell: ({ row }) => row.original.customer,
  },
  {
    accessorKey: 'whatsApp',
    header: () => {
      return <Button variant="ghost">WhatsApp</Button>
    },
    cell: ({ row }) => row.original.whatsApp,
  },
  {
    accessorKey: 'valor',
    header: () => {
      return <Button variant="ghost">Valor da obra</Button>
    },
    cell: ({ row }) => (
      <span>
        {formatValue(row.original.amount, {
          isCurrency: true,
          fractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: 'datas',
    header: () => {
      return <Button variant="ghost">Datas</Button>
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        {row.original.startDateOfWork && (
          <p className="text-xs">
            <span className="font-semibold">Início:</span>{' '}
            {format(row.original.startDateOfWork, 'dd MMMM yyyy', {
              locale: ptBR,
            })}
          </p>
        )}
        {row.original.orderDate && (
          <p className="text-xs">
            <span className="font-semibold">Pedido:</span>{' '}
            {format(row.original.orderDate, 'dd MMMM yyyy', {
              locale: ptBR,
            })}
          </p>
        )}
        {row.original.deliveryDate && (
          <p className="text-xs">
            <span className="font-semibold">Entrega:</span>{' '}
            {format(row.original.deliveryDate, 'dd MMMM yyyy', {
              locale: ptBR,
            })}
          </p>
        )}
        <p className="text-xs">
          <span className="font-semibold">Cadastro:</span>{' '}
          {format(row.original.createdAt, 'dd MMMM yyyy', { locale: ptBR })}
        </p>

        {row.original.approvalDate && (
          <p className="text-xs">
            <span className="font-semibold">Homologado:</span>{' '}
            {format(row.original.approvalDate, 'dd MMMM yyyy', {
              locale: ptBR,
            })}
          </p>
        )}
        {row.original.equipamentArrivalDate && (
          <p className="text-xs">
            <span className="font-semibold">Recebimento:</span>{' '}
            {format(row.original.equipamentArrivalDate, 'dd MMMM yyyy', {
              locale: ptBR,
            })}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'entradas',
    header: () => {
      return <Button variant="ghost">Entradas</Button>
    },
    cell: ({ row }) => (
      <span>
        {formatValue(row.original.incomes, {
          isCurrency: true,
          fractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: 'custos',
    header: () => {
      return <Button variant="ghost">Custos</Button>
    },
    cell: ({ row }) => {
      const expenses = row.original.expenses

      return (
        <span className={cn(expenses < 0 && 'text-red-500')}>
          {formatValue(row.original.expenses, {
            isCurrency: true,
            fractionDigits: 2,
          })}
        </span>
      )
    },
  },
  {
    accessorKey: 'líquido',
    header: () => {
      return <Button variant="ghost">Líquido</Button>
    },
    cell: ({ row }) => {
      const remaining = row.original.remaining

      return (
        <span className={cn(remaining > 0 && 'text-green-500')}>
          {formatValue(remaining, {
            isCurrency: true,
            fractionDigits: 2,
          })}
        </span>
      )
    },
  },
  {
    accessorKey: 'situação',
    header: () => {
      return <Button variant="ghost">Situação</Button>
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn('uppercase', styleWorkRole(row.original.role))}
      >
        {translateWorkRole(row.original.role)}
      </Badge>
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
