import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'

import { insertTeamSchema } from '@/features/teams/schema'

const app = new Hono()
  .get(
    '/',
    verifyAuth(),
    zValidator(
      'query',
      z.object({
        status: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { status: statusValue } = c.req.valid('query')

      const status = statusFilter(statusValue)

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      const data = await db.team.findMany({
        where: { enterpriseId: enterprise.id, status },
        include: {
          users: { select: { user: { select: { id: true, name: true } } } },
          works: { select: { workId: true, work: { select: { cod: true } } } },
        },
        orderBy: { name: 'asc' },
      })

      return c.json({ data }, 200)
    },
  )
  .get(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      const data = await db.team.findUnique({
        where: { id, enterpriseId: enterprise.id },
        include: {
          users: { select: { user: { select: { id: true, name: true } } } },
        },
      })

      if (!data) {
        return c.json({ error: 'Equipe não cadastrada' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .post('/', verifyAuth(), zValidator('json', insertTeamSchema), async (c) => {
    const auth = c.get('authUser')
    const validatedFields = c.req.valid('json')

    if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
    const { employees, ...values } = validatedFields

    if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const user = await db.user.findUnique({ where: { id: auth.token.sub } })
    if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

    if (
      ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
        user.role,
      )
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

    await db.team.create({
      data: {
        id: createId(),
        enterpriseId: enterprise.id,
        users: {
          createMany: {
            data: employees.map((employee) => ({ userId: employee })),
          },
        },
        ...values,
      },
    })

    return c.json({ success: 'Equipe criada' }, 201)
  })
  .post(
    '/bulk-delete',
    verifyAuth(),
    zValidator('json', z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = c.get('authUser')
      const { ids } = c.req.valid('json')

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      await db.team.updateMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
        data: { status: false },
      })

      return c.json({ success: 'Equipes bloqueadas' }, 200)
    },
  )
  .patch(
    '/:id/undelete',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      const data = await db.team.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Equipe não cadastrada' }, 404)
      }

      return c.json({ success: 'Equipe desbloqueada' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertTeamSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { employees, ...values } = validatedFields

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      const currentEmployeeIds = await db.team.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: { users: { select: { userId: true } } },
      })

      const employeeIds = new Set(
        currentEmployeeIds?.users.map((employee) => employee.userId),
      )

      const [toAdd, toRemove] = await Promise.all([
        employees
          .filter((employee) => !employeeIds.has(employee))
          .map((employee) => ({ userId: employee })),
        currentEmployeeIds?.users
          .filter((employee) => !new Set(employees).has(employee.userId))
          .map((employee) => employee.userId),
      ])

      const data = await db.team.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          ...values,
          users: {
            createMany: {
              data: toAdd,
            },
            deleteMany: { userId: { in: toRemove } },
          },
        },
      })

      if (!data) {
        return c.json({ error: 'Equipe não cadastrada' }, 404)
      }

      return c.json({ success: 'Equipe atualizada' }, 200)
    },
  )
  .delete(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub || !auth.token?.selectedEnterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![UserRole.OWNER as string, UserRole.MANAGER as string].includes(
          user.role,
        )
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

      const data = await db.team.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Equipe não cadastrada' }, 404)
      }

      return c.json({ success: 'Equipe bloqueada' }, 200)
    },
  )

export default app
