'use client'

import { WorkRole } from '@prisma/client'

import { translateWorkRole } from '@/lib/i18n'
import { createEnumOptions } from '@/lib/utils'

import { useNewWork } from '@/features/works/hooks/use-new-work'
import { useFilterUser } from '@/features/users/hooks/use-filter-user'

import { Button } from '@/components/ui/button'
import { SelectFilter } from '@/components/select-filter'

export const Actions = () => {
  const { onOpen } = useNewWork()

  const { onChangeRole, role } = useFilterUser()

  const roleOptions: FilterOptionsProps = [
    { label: 'Todos', value: undefined },
    ...createEnumOptions(WorkRole, (key) => translateWorkRole(key as WorkRole)),
  ]

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onOpen}>Adicionar</Button>
      <SelectFilter
        placeholder="Selecione situação"
        defaultValue={undefined}
        value={role}
        data={roleOptions}
        onChange={onChangeRole}
        className="w-full min-w-32"
      />
    </div>
  )
}
