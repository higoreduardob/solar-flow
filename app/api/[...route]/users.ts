import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'
import { filterFiles, managerFile } from '@/lib/cloudinary'

import { insertUserSchema } from '@/features/users/schema'

const app = new Hono()
  .get(
    '/',
    verifyAuth(),
    zValidator(
      'query',
      z.object({
        role: z.nativeEnum(UserRole).optional(),
        status: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { role, status: statusValue } = c.req.valid('query')

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

      const roles: UserRole[] = role ? [role] : ['EMPLOYEE', 'MANAGER']

      const users = await db.user.findMany({
        where: {
          ownerId,
          NOT: { id: user.id },
          enterpriseBelongId: enterprise.id,
          role: { in: roles },
          status,
        },
        include: { address: true },
        orderBy: { name: 'asc' },
      })

      const data = users.map(({ password, ...rest }) => rest)

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

      const data = await db.user.findUnique({
        where: {
          id,
          ownerId,
          enterpriseBelongId: enterprise.id,
        },
        include: {
          address: true,
          documents: {
            omit: { createdAt: true, id: true, updatedAt: true, userId: true },
          },
        },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      const { password, ...rest } = data

      return c.json({ data: rest }, 200)
    },
  )
  .post('/', verifyAuth(), zValidator('json', insertUserSchema), async (c) => {
    const auth = c.get('authUser')
    const validatedFields = c.req.valid('json')

    // TODO: Improve remove files in error

    if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
    const {
      email,
      role,
      address,
      documents,
      password,
      repeatPassword,
      ...values
    } = validatedFields

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

    const existingUser = await db.user.findUnique({
      where: {
        unique_email_role_per_enterprise: {
          email,
          role,
          enterpriseBelongId: enterprise.id,
        },
      },
    })
    if (existingUser)
      return c.json({ error: 'Usuário já cadastrado, para essa empresa' }, 400)

    // TODO: Add password and selected enterprise

    await db.user.create({
      data: {
        id: createId(),
        email,
        role,
        owner: {
          connect: { id: ownerId },
        },
        enterpriseBelong: {
          connect: { id: enterprise.id },
        },
        address: {
          create: { ...address },
        },
        documents: { createMany: { data: documents || [] } },
        ...values,
      },
    })

    return c.json({ success: 'Usuário criado' }, 201)
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

      await db.user.updateMany({
        where: {
          id: { in: ids },
          enterpriseBelongId: enterprise.id,
          ownerId,
        },
        data: { status: false },
      })

      return c.json({ success: 'Usuários bloqueados' }, 200)
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

      const data = await db.user.update({
        where: { id, enterpriseBelongId: enterprise.id, ownerId },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      return c.json({ success: 'Usuário desbloqueado' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertUserSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      // TODO: Improve remove files in error

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const {
        email,
        role,
        address,
        documents,
        password,
        repeatPassword,
        ...values
      } = validatedFields

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

      const existingUser = await db.user.findFirst({
        where: {
          email,
          role,
          enterpriseBelongId: enterprise.id,
          NOT: { id },
        },
      })
      if (existingUser)
        return c.json(
          { error: 'Usuário já cadastrado, para essa empresa' },
          400,
        )

      const currentDocumentIds = await db.user.findUnique({
        where: { id, ownerId },
        select: { documents: { select: { publicId: true } } },
      })

      const { toAdd, toRemove } = await filterFiles(
        documents,
        currentDocumentIds?.documents,
      )

      if (toRemove && toRemove.length > 0) {
        await Promise.all(
          toRemove.map(async (item) =>
            managerFile('users', item).catch((err) =>
              c.json({ error: err }, 400),
            ),
          ),
        )
      }

      const data = await db.user.update({
        where: { id, ownerId, enterpriseBelongId: enterprise.id },
        data: {
          email,
          role,
          ...values,
          address: {
            upsert: {
              create: { ...address },
              update: { ...address },
            },
          },
          documents: {
            deleteMany: { publicId: { in: toRemove } },
            createMany: { data: toAdd || [] },
          },
        },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      return c.json({ success: 'Usuário atualizado' }, 200)
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

      const data = await db.user.update({
        where: { id, ownerId, enterpriseBelongId: enterprise.id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      return c.json({ success: 'Usuário bloqueado' }, 200)
    },
  )

export default app
