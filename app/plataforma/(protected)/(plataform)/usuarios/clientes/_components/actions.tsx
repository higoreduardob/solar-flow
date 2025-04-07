'use client'

import { useNewUser } from '@/features/users/hooks/use-new-user'

import { Button } from '@/components/ui/button'

export const Actions = () => {
  const { onOpen: onOpenNewUser } = useNewUser()

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => onOpenNewUser('CUSTOMER')}>Adicionar</Button>
    </div>
  )
}
