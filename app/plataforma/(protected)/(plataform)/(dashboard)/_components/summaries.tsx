'use client'
import { PiggyBank, Settings, TrendingDown, TrendingUp } from 'lucide-react'

import { formatDateRange } from '@/lib/utils'

import { useGetSummaries } from '@/features/summaries/api/use-get-summaries'

import {
  CardAnalytic,
  CardAnalyticLoading,
} from '@/app/plataforma/_components/card-analytic'
import {
  ChartVariant,
  CharVariantLoading,
} from '@/app/plataforma/_components/chart-variant'

export const Summaries = () => {
  const summariesQuery = useGetSummaries()
  const summaries = summariesQuery.data
  const isLoading = summariesQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardAnalyticLoading key={index} />
          ))}
        </div>
        <CharVariantLoading />
      </div>
    )
  }

  const dateRangeLabel = formatDateRange({
    from: summaries?.startDate,
    to: summaries?.endDate,
  })
  const analytics = summaries?.analytics
  const overview = summaries?.overview || []

  return (
    <div className="flex flex-col gap-2">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2">
        <CardAnalytic
          title="Obras em andamento"
          value={analytics?.currentWorks}
          percentageChange={analytics?.worksChange}
          icon={Settings}
          variant="warning"
          dateRange={dateRangeLabel}
          isCurrency={false}
        />
        <CardAnalytic
          title="Lucro"
          value={analytics?.currentRemaining}
          percentageChange={analytics?.remainingChange}
          icon={PiggyBank}
          variant="default"
          dateRange={dateRangeLabel}
        />
        <CardAnalytic
          title="Entradas"
          value={analytics?.currentIncomes}
          percentageChange={analytics?.incomesChange}
          icon={TrendingUp}
          variant="success"
          dateRange={dateRangeLabel}
        />
        <CardAnalytic
          title="Custos"
          value={analytics?.currentExpenses}
          percentageChange={analytics?.expensesChange}
          icon={TrendingDown}
          variant="danger"
          dateRange={dateRangeLabel}
        />
      </div>
      <ChartVariant
        title="Financeiro"
        data={overview}
        fields={[
          {
            key: 'remaining',
            color: 'oklch(62.3% 0.214 259.815)',
            label: 'Líquido',
          },
          {
            key: 'incomes',
            color: 'oklch(69.6% 0.17 162.48)',
            label: 'Entradas',
          },
          {
            key: 'expenses',
            color: 'oklch(64.5% 0.246 16.439)',
            label: 'Custos',
          },
        ]}
      />
    </div>
  )
}
