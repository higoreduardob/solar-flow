import { PencilRuler, X } from 'lucide-react'

import { WorkRole } from '@prisma/client'

import { useConfirm } from '@/hooks/use-confirm'
import { useOpenWorkMaterial } from '@/features/works/materials/hooks/use-open-work-material'
import { useDeleteWorkMaterial } from '@/features/works/materials/api/use-delete-work-material'

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
}

export const Actions = ({ id, workId, role }: Props) => {
  const { onOpen } = useOpenWorkMaterial()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const deleteMutation = useDeleteWorkMaterial(id, workId)
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
            onClick={() => onOpen(id, workId)}
          >
            <PencilRuler className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={disabled}
          >
            <X className="size-4 mr-2" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
