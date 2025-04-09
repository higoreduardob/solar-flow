'use client'

import { WorkRole } from '@prisma/client'

import { translateWorkRole } from '@/lib/i18n'
import { createEnumOptions } from '@/lib/utils'

import { useNewWork } from '@/features/works/hooks/use-new-work'
import { useFilterWork } from '@/features/works/hooks/use-filter-work'

import { Button } from '@/components/ui/button'
import { SelectFilter } from '@/components/select-filter'
import { DateRangePicker } from '@/components/date-range-picker'

export const Actions = () => {
  const {
    onChangeRole,
    role,
    from,
    to,
    onChangeFilterDate,
    onClearFilterDate,
  } = useFilterWork()
  const { onOpen } = useNewWork()

  const roleOptions: FilterOptionsProps = [
    { label: 'Todos', value: undefined },
    ...createEnumOptions(WorkRole, (key) => translateWorkRole(key as WorkRole)),
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap w-full lg:w-fit">
      <Button onClick={onOpen}>Adicionar</Button>
      <DateRangePicker
        from={from}
        to={to}
        onChangeFilterDate={onChangeFilterDate}
        onClearFilterDate={onClearFilterDate}
      />
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
