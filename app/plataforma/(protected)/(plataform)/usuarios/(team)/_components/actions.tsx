'use client'

import { UserRole } from '@prisma/client'

import { translateUserRole } from '@/lib/i18n'
import { createEnumOptions } from '@/lib/utils'

import { useNewUser } from '@/features/users/hooks/use-new-user'
import { useFilterUser } from '@/features/users/hooks/use-filter-user'

import { Button } from '@/components/ui/button'
import { SelectFilter } from '@/components/select-filter'

export const Actions = () => {
  const { onOpen } = useNewUser()
  const { onChangeRole, role } = useFilterUser()

  // TODO: Remove role
  const roleOptions: FilterOptionsProps = [
    { label: 'Todos', value: undefined },
    ...createEnumOptions(UserRole, (key) => translateUserRole(key as UserRole)),
  ]

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onOpen}>Adicionar</Button>
      <SelectFilter
        placeholder="Selecione tipo"
        defaultValue={undefined}
        value={role}
        data={roleOptions}
        onChange={onChangeRole}
        className="w-full min-w-32"
      />
    </div>
  )
}
