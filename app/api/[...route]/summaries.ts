import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { zValidator } from '@hono/zod-validator'
import { differenceInDays, parse, subDays } from 'date-fns'

import { Prisma, UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { fillMissingDays } from '@/lib/utils'

const app = new Hono().get(
  '/',
  verifyAuth(),
  zValidator(
    'query',
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }),
  ),
  async (c) => {
    const auth = c.get('authUser')
    const { from, to } = c.req.valid('query')

    if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const user = await db.user.findUnique({ where: { id: auth.token.sub } })
    if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

    if (
      ![
        UserRole.OWNER as string,
        UserRole.MANAGER as string,
        UserRole.EMPLOYEE as string,
      ].includes(user.role)
    ) {
      return c.json({ error: 'Usuário sem autorização' }, 400)
    }
    const ownerId = user.role === UserRole.OWNER ? user.id : user.ownerId!

    const enterprise = await db.enterprise.findUnique({
      where: {
        id: auth.token.selectedEnterprise.id,
        owners: {
          some: {
            userId: ownerId,
          },
        },
      },
    })
    if (!enterprise) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const defaultTo = new Date()
    const defaultFrom = subDays(defaultTo, 7)

    const startDate = from ? parse(from, 'yyyy-MM-dd', new Date()) : defaultFrom
    const endDate = to ? parse(to, 'yyyy-MM-dd', new Date()) : defaultTo

    const periodLength = differenceInDays(endDate, startDate) + 1
    const lastPeriodStart = subDays(startDate, periodLength)
    const lastPeriodEnd = subDays(endDate, periodLength)

    type AnalyticsResult = {
      analytics: {
        currentWorks: number
        lastWorks: number
        currentIncomes: number
        lastIncomes: number
        currentExpenses: number
        lastExpenses: number
        currentRemaining: number
        lastRemaining: number
      }
      overview: Array<{
        date: string
        incomes: number
        expenses: number
        remaining: number
      }>
    }

    const result = await db.$queryRaw<AnalyticsResult[]>(
      Prisma.sql`
      WITH current_works AS (
        SELECT 
          w.id as work_id,
          w."createdAt" as created_at
        FROM "Work" w
        WHERE 
          w."enterpriseId" = ${enterprise.id}
          AND w."createdAt" >= ${startDate}
          AND w."createdAt" <= ${endDate}
      ),
      last_works AS (
        SELECT 
          w.id as work_id,
          w."createdAt" as created_at
        FROM "Work" w
        WHERE 
          w."enterpriseId" = ${enterprise.id}
          AND w."createdAt" >= ${lastPeriodStart}
          AND w."createdAt" <= ${lastPeriodEnd}
      ),
      current_transactions AS (
        SELECT 
          t.id as transaction_id,
          t.amount as amount,
          t."workId" as work_id,
          t."createdAt" as created_at
        FROM "Transaction" t
        JOIN current_works cw ON t."workId" = cw.work_id
        WHERE t."enterpriseId" = ${enterprise.id}
      ),
      last_transactions AS (
        SELECT 
          t.id as transaction_id,
          t.amount as amount,
          t."workId" as work_id
        FROM "Transaction" t
        JOIN last_works lw ON t."workId" = lw.work_id
        WHERE t."enterpriseId" = ${enterprise.id}
      ),
      current_materials AS (
        SELECT 
          wm."workId" as work_id,
          SUM(wm.amount) as total_amount,
          wm."createdAt" as created_at
        FROM "WorkMaterial" wm
        JOIN current_works cw ON wm."workId" = cw.work_id
        GROUP BY wm."workId", wm."createdAt"
      ),
      last_materials AS (
        SELECT 
          wm."workId" as work_id,
          SUM(wm.amount) as total_amount
        FROM "WorkMaterial" wm
        JOIN last_works lw ON wm."workId" = lw.work_id
        GROUP BY wm."workId"
      ),
      current_metrics AS (
        SELECT 
          COUNT(DISTINCT cw.work_id)::float as works_count,
          COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0)::float as incomes,
          COALESCE(SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END), 0)::float + 
            COALESCE((SELECT SUM(cm.total_amount) FROM current_materials cm), 0)::float as expenses,
          COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0)::float - 
            (COALESCE(SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END), 0)::float + 
            COALESCE((SELECT SUM(cm.total_amount) FROM current_materials cm), 0)::float) as remaining
        FROM current_works cw
        LEFT JOIN current_transactions ct ON cw.work_id = ct.work_id
      ),
      last_metrics AS (
        SELECT 
          COUNT(DISTINCT lw.work_id)::float as works_count,
          COALESCE(SUM(CASE WHEN lt.amount > 0 THEN lt.amount ELSE 0 END), 0)::float as incomes,
          COALESCE(SUM(CASE WHEN lt.amount < 0 THEN ABS(lt.amount) ELSE 0 END), 0)::float + 
            COALESCE((SELECT SUM(lm.total_amount) FROM last_materials lm), 0)::float as expenses,
          COALESCE(SUM(CASE WHEN lt.amount > 0 THEN lt.amount ELSE 0 END), 0)::float - 
            (COALESCE(SUM(CASE WHEN lt.amount < 0 THEN ABS(lt.amount) ELSE 0 END), 0)::float + 
            COALESCE((SELECT SUM(lm.total_amount) FROM last_materials lm), 0)::float) as remaining
        FROM last_works lw
        LEFT JOIN last_transactions lt ON lw.work_id = lt.work_id
      ),
      date_series AS (
        SELECT 
          generate_series(
            ${startDate}::date, 
            ${endDate}::date, 
            '1 day'::interval
          )::date as date
      ),
      daily_transactions AS (
        SELECT 
          ds.date,
          COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0)::float as daily_incomes,
          COALESCE(SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END), 0)::float as daily_expenses,
          COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0)::float - 
            COALESCE(SUM(CASE WHEN ct.amount < 0 THEN ABS(ct.amount) ELSE 0 END), 0)::float as daily_remaining
        FROM date_series ds
        LEFT JOIN current_transactions ct ON DATE(ct.created_at) = ds.date
        GROUP BY ds.date
        ORDER BY ds.date
      ),
      overview_data AS (
        SELECT 
          jsonb_agg(
            jsonb_build_object(
              'date', to_char(date, 'YYYY-MM-DD'),
              'incomes', daily_incomes,
              'expenses', daily_expenses,
              'remaining', daily_remaining
            )
          ) as overview
        FROM daily_transactions
      )
      SELECT 
        jsonb_build_object(
          'currentWorks', (SELECT works_count FROM current_metrics),
          'lastWorks', (SELECT works_count FROM last_metrics),
          'currentIncomes', (SELECT incomes FROM current_metrics),
          'lastIncomes', (SELECT incomes FROM last_metrics),
          'currentExpenses', (SELECT expenses FROM current_metrics),
          'lastExpenses', (SELECT expenses FROM last_metrics),
          'currentRemaining', (SELECT remaining FROM current_metrics),
          'lastRemaining', (SELECT remaining FROM last_metrics)
        ) as "analytics",
        (SELECT overview FROM overview_data) as "overview"
      `,
    )

    const { analytics, overview } = result[0]

    const fillOverview = fillMissingDays(
      overview,
      startDate,
      endDate,
    ) as AnalyticsResult['overview']

    return c.json(
      {
        data: {
          analytics,
          overview: fillOverview,
          startDate,
          endDate,
        },
      },
      200,
    )
  },
)

export default app
