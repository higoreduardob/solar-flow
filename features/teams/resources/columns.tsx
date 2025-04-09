'use client'

import { InferResponseType } from 'hono'
import { ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'

import { client } from '@/lib/hono'

import { Actions } from '@/features/teams/resources/actions'

import { useOpenUser } from '@/features/users/hooks/use-open-user'
import { useOpenTeamData } from '@/features/teams/hooks/use-open-team'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export type ResponseType = InferResponseType<
  (typeof client.api)['teams']['$get'],
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
          Equipe
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'obras',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Obras
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const router = useRouter()
      const { onClose } = useOpenTeamData()
      const works = row.original.works

      const goToDetail = (workId: string) => {
        onClose()
        router.push(`/plataforma/obras/${workId}`)
      }

      return works.length > 0 ? (
        <div className="flex items-center gap-1">
          {works.map((work, index) => (
            <Badge
              key={index}
              onClick={() => goToDetail(work.workId)}
              className="cursor-pointer"
            >
              {work.work.cod}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          Nenhum registro cadastrado
        </span>
      )
    },
  },
  {
    accessorKey: 'colaboradores',
    header: () => {
      return <Button variant="ghost">Colaboradores</Button>
    },
    cell: ({ row }) => {
      const { onOpen } = useOpenUser()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Visualizar</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {row.original.users.map((user, index) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => onOpen(user.user.id)}
              >
                {user.user.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <Actions status={row.original.status} id={row.original.id} />
    ),
  },
]
