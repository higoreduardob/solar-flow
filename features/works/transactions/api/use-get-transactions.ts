import { useQuery } from '@tanstack/react-query'

import { client } from '@/lib/hono'
import { convertAmountFromMiliunits } from '@/lib/utils'

export const useGetTransactions = (workId?: string) => {
  const query = useQuery({
    queryKey: ['transactions', workId],

    queryFn: async () => {
      const response = await client.api.transactions.works[':workId'].$get({
        param: { workId },
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error)
      }

      const { data } = await response.json()
      return {
        ...data,
        incomes: data.incomes.map((income) => ({
          ...income,
          amount: convertAmountFromMiliunits(income.amount),
        })),
        expenses: data.expenses.map((expense) => ({
          ...expense,
          amount: convertAmountFromMiliunits(expense.amount),
        })),
      }
    },
  })

  return query
}
