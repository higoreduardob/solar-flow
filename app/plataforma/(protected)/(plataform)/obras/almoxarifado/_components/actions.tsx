'use client'

import { useNewMaterial } from '@/features/materials/hooks/use-new-material'

import { Button } from '@/components/ui/button'

export const Actions = () => {
  const { onOpen } = useNewMaterial()

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onOpen}>Adicionar</Button>
    </div>
  )
}
