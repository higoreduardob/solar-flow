import { Ban, PencilRuler } from 'lucide-react'

import { useConfirm } from '@/hooks/use-confirm'
import { useOpenMeasure } from '@/features/materials/measures/hooks/use-open-measure'
import { useDeleteMeasure } from '@/features/materials/measures/api/use-delete-measure'
import { useUndeleteMeasure } from '@/features/materials/measures/api/use-undelete-measure'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
  status: boolean
}

export const Actions = ({ id, status }: Props) => {
  const { onOpen } = useOpenMeasure()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const deleteMutation = useDeleteMeasure(id)
  const undeleteMutation = useUndeleteMeasure(id)

  const handleDelete = async () => {
    const ok = await confirm()

    if (ok) {
      if (status) deleteMutation.mutate()
      else undeleteMutation.mutate()
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
            onClick={() => onOpen(id)}
          >
            <PencilRuler className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
            <Ban className="size-4 mr-2" />
            {status ? 'Bloquear' : 'Desbloquear'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
