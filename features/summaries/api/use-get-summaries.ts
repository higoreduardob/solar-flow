import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'

import {
  calculatePercentageChange,
  convertAmountFromMiliunits,
} from '@/lib/utils'
import { client } from '@/lib/hono'

import { useFilterSummary } from '@/features/summaries/hooks/use-filter-summary'

export const useGetSummaries = () => {
  const { from, to } = useFilterSummary()

  const query = useQuery({
    queryKey: ['summaries', from, to],
    queryFn: async () => {
      const response = await client.api['summaries'].$get({
        query: { from, to },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()

      const analytics = data.analytics

      const worksChange = calculatePercentageChange(
        analytics.currentWorks,
        analytics.lastWorks,
      )
      const incomesChange = calculatePercentageChange(
        analytics.currentIncomes,
        analytics.lastIncomes,
      )
      const expensesChange = calculatePercentageChange(
        analytics.currentExpenses,
        analytics.lastExpenses,
      )
      const remainingChange = calculatePercentageChange(
        analytics.currentRemaining,
        analytics.lastRemaining,
      )

      return {
        ...data,
        analytics: {
          ...analytics,
          currentIncomes: convertAmountFromMiliunits(analytics.currentIncomes),
          currentExpenses: convertAmountFromMiliunits(
            analytics.currentExpenses,
          ),
          currentRemaining: convertAmountFromMiliunits(
            analytics.currentRemaining,
          ),
          worksChange,
          incomesChange,
          expensesChange,
          remainingChange,
        },
        overview: data.overview.map((item) => ({
          ...item,
          date: format(new Date(item.date + 'T00:00:00'), 'dd MMM', {
            locale: ptBR,
          }),
          incomes: convertAmountFromMiliunits(item.incomes),
          expenses: convertAmountFromMiliunits(item.expenses),
          remaining: convertAmountFromMiliunits(item.remaining),
        })),
      }
    },
  })

  return query
}
