import { Ban, PencilRuler } from 'lucide-react'

import { WorkRole } from '@prisma/client'

import { useConfirm } from '@/hooks/use-confirm'
import { useOpenTransaction } from '@/features/works/transactions/hooks/use-open-transaction'
import { useDeleteTransaction } from '@/features/works/transactions/api/use-delete-transaction'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
  workId: string
  role: WorkRole
  isExpenses: boolean
}

export const Actions = ({ id, workId, role, isExpenses }: Props) => {
  const { onOpen } = useOpenTransaction()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const deleteMutation = useDeleteTransaction(id)
  const isNonInProgress = role !== 'INPROGRESS'
  const disabled = deleteMutation.isPending || isNonInProgress

  const handleDelete = async () => {
    if (disabled) return

    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate()
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Ações</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={deleteMutation.isPending}
            onClick={() => onOpen(id, workId, isExpenses)}
          >
            <PencilRuler className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={disabled}
          >
            <Ban className="size-4 mr-2" />
            {status ? 'Bloquear' : 'Desbloquear'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
