import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'

import { insertCategorySchema } from '@/features/materials/categories/schema'

const app = new Hono()
  .get(
    '/',
    verifyAuth(),
    zValidator('query', z.object({ status: z.string().optional() })),
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

      const data = await db.category.findMany({
        where: { enterpriseId: enterprise.id, status },
        include: { _count: { select: { materials: true } } },
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

      const data = await db.category.findUnique({
        where: { id, enterpriseId: enterprise.id },
      })

      if (!data) {
        return c.json({ error: 'Categoria não cadastrada' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .post(
    '/',
    verifyAuth(),
    zValidator('json', insertCategorySchema),
    async (c) => {
      const auth = c.get('authUser')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { name } = validatedFields

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

      const existingCategory = await db.category.findUnique({
        where: {
          unique_name_per_enterprise: { name, enterpriseId: enterprise.id },
        },
      })
      if (existingCategory) {
        return c.json({ error: 'Já existe categoria com este nome' }, 400)
      }

      await db.category.create({
        data: {
          id: createId(),
          name,
          enterpriseId: enterprise.id,
        },
      })

      return c.json({ success: 'Categoria criada' }, 201)
    },
  )
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

      await db.category.updateMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
        data: { status: false },
      })

      return c.json({ success: 'Categorias bloqueadas' }, 200)
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

      if (user.role === UserRole.EMPLOYEE)
        return c.json({ error: 'Usuário não autorizado' }, 401)

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

      const data = await db.category.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Categoria não cadastrada' }, 404)
      }

      return c.json({ success: 'Categoria desbloqueada' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertCategorySchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { name } = validatedFields

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

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

      const existingCategory = await db.category.findFirst({
        where: { name, enterpriseId: enterprise.id, NOT: { id } },
      })
      if (existingCategory) {
        return c.json({ error: 'Já existe categoria com este nome' }, 400)
      }

      const currentCategory = await db.category.findUnique({
        where: { id, enterpriseId: enterprise.id },
      })
      if (!currentCategory) {
        return c.json({ error: 'Categoria não cadastrada' }, 404)
      }

      await db.category.update({
        where: { id, enterpriseId: enterprise.id },
        data: { name },
      })

      return c.json({ success: 'Categoria atualizada' }, 200)
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

      const data = await db.category.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Categoria não cadastrada' }, 404)
      }

      return c.json({ success: 'Categoria bloqueada' }, 200)
    },
  )

export default app
