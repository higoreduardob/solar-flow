'use client'

import { useNewEquipament } from '@/features/equipaments/hooks/use-new-equipament'

import { Button } from '@/components/ui/button'

export const Actions = () => {
  const { onOpen } = useNewEquipament()

  return (
    <div className="flex items-center gap-2">
      {/* TODO: Add Role filter */}
      <Button onClick={onOpen}>Adicionar</Button>
    </div>
  )
}
