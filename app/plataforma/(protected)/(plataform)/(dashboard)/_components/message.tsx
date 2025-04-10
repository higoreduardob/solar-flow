'use client'

import Link from 'next/link'

import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { useFilterSummary } from '@/features/summaries/hooks/use-filter-summary'

import { DateRangePicker } from '@/components/date-range-picker'

export const Message = () => {
  const { user } = useCurrentUser()
  const { from, to, onChangeFilterDate, onClearFilterDate } = useFilterSummary()

  return (
    <div className="flex items-center flex-col sm:flex-row justify-between w-full gap-2">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-medium dark:text-white text-zinc-950">
          Olá, {user?.name} 👋
        </h3>
        <p className="text-sm dark:text-gray-400 text-gray-700">
          No painel administrativo. você pode visualizar todas suas{' '}
          <Link href="/plataforma/obras" className="text-blue-500">
            obras
          </Link>
          , gerenciar{' '}
          <Link href="/plataforma/usuarios" className="text-blue-500">
            equipe
          </Link>{' '}
          , editar detalhes da{' '}
          <Link href="/plataforma/conta" className="text-blue-500">
            conta
          </Link>{' '}
          e{' '}
          <Link href="/plataforma/seguranca" className="text-blue-500">
            senha
          </Link>
          .
        </p>
      </div>
      <DateRangePicker
        from={from}
        to={to}
        onChangeFilterDate={onChangeFilterDate}
        onClearFilterDate={onClearFilterDate}
        className="sm:w-fit"
      />
    </div>
  )
}
