import { useRouter } from 'next/navigation'
import {
  Ban,
  CircleX,
  DollarSign,
  PencilRuler,
  Settings,
  Timer,
  TrendingDown,
} from 'lucide-react'

import { useConfirm } from '@/hooks/use-confirm'

import { useDeleteUser } from '@/features/users/api/use-delete-user'
import { useUndeleteUser } from '@/features/users/api/use-undelete-user'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { WorkRole } from '@prisma/client'
import { useDeleteWork } from '@/features/works/api/use-delete-work'
import { useCanceledWork } from '@/features/works/api/use-canceled-work'
import { useCompletedWork } from '@/features/works/api/use-completed-work'
import { useUndeleteWork } from '@/features/works/api/use-undelete-work'

type Props = {
  id: string
  status: boolean
  role: WorkRole
}

export const Actions = ({ id, status, role }: Props) => {
  const router = useRouter()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const isNonInProgress = role !== 'INPROGRESS'

  const deleteMutation = useDeleteWork(id)
  const canceledMutation = useCanceledWork(id)
  const undeleteMutation = useUndeleteWork(id)
  const completedMutation = useCompletedWork(id)
  const isPending =
    deleteMutation.isPending ||
    canceledMutation.isPending ||
    completedMutation.isPending ||
    isNonInProgress

  const handleDelete = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      if (status) deleteMutation.mutate()
      else undeleteMutation.mutate()
    }
  }

  const onCanceled = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      canceledMutation.mutate()
    }
  }

  const onCompleted = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      completedMutation.mutate()
    }
  }

  const goToDetail = () => router.push(`/plataforma/obras/${id}`)

  return (
    <>
      <ConfirmationDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Ações</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={goToDetail}>
            <PencilRuler className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending}
            // onClick={() => onOpenTransaction(id, false)}
          >
            <DollarSign className="size-4 mr-2" />
            Entrada
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending}
            // onClick={() => onOpenTransaction(id, true)}
          >
            <TrendingDown className="size-4 mr-2" />
            Despesa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending}
            // onClick={() => onOpenWorkMaterial(id)}
          >
            <Settings className="size-4 mr-2" />
            Material
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending}
            onClick={onCompleted}
          >
            <Timer className="size-4 mr-2" />
            Entregar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending}
            onClick={onCanceled}
          >
            <CircleX className="size-4 mr-2" />
            Cancelar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Ban className="size-4 mr-2" />
            {status ? 'Bloquear' : 'Desbloquear'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
