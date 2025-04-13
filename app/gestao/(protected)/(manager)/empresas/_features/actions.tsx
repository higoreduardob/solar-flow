import { PencilRuler, Plus } from 'lucide-react'

import { useOpenOwner } from '@/features/manager/hooks/use-open-owner'
import { useOpenEnterprise } from '@/features/manager/hooks/use-open-enterprise'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const { onOpen: onOpenEnterprise } = useOpenEnterprise()
  const { onOpen: onOpenOwner } = useOpenOwner()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">Ações</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onOpenEnterprise(id)}
        >
          <PencilRuler className="size-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => onOpenOwner(id)}
        >
          <Plus className="size-4 mr-2" />
          Proprietário
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
