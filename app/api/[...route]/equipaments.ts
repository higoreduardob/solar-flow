import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'
import { managerFile } from '@/lib/cloudinary'

import { insertEquipamentSchema } from '@/features/equipaments/schema'

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

      const data = await db.equipament.findMany({
        where: { enterpriseId: enterprise.id, status },
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

      const data = await db.equipament.findUnique({
        where: { id, enterpriseId: enterprise.id },
        include: {
          inmetro: { omit: { id: true, createdAt: true, updatedAt: true } },
          datasheet: { omit: { id: true, createdAt: true, updatedAt: true } },
        },
      })

      if (!data) {
        return c.json({ error: 'Equipamento não cadastrado' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .post(
    '/',
    verifyAuth(),
    zValidator('json', insertEquipamentSchema),
    async (c) => {
      const auth = c.get('authUser')
      const validatedFields = c.req.valid('json')

      // TODO: Improve remove files in error

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { name, role, inmetro, datasheet, ...values } = validatedFields

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

      const existingEquipament = await db.equipament.findUnique({
        where: {
          unique_name_role_per_enterprise: {
            name,
            enterpriseId: enterprise.id,
            role,
          },
        },
      })
      if (existingEquipament) {
        return c.json(
          { error: 'Já existe equipamento deste tipo com esse nome' },
          400,
        )
      }

      // TODO: Remove document

      await db.equipament.create({
        data: {
          id: createId(),
          name,
          enterprise: {
            connect: { id: enterprise.id },
          },
          role,
          ...(inmetro && {
            inmetro: {
              create: {
                id: createId(),
                ...inmetro,
              },
            },
          }),
          ...(datasheet && {
            datasheet: {
              create: {
                id: createId(),
                ...datasheet,
              },
            },
          }),
          ...values,
        },
      })

      return c.json({ success: 'Equipamento criado' }, 201)
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

      await db.equipament.updateMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
        data: { status: false },
      })

      return c.json({ success: 'Equipamentos bloqueados' }, 200)
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

      const data = await db.equipament.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Equipamento não cadastrado' }, 404)
      }

      return c.json({ success: 'Equipamento desbloqueado' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertEquipamentSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      // TODO: Improve remove files in error

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { name, role, inmetro, datasheet, ...values } = validatedFields

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

      const existingEquipament = await db.equipament.findFirst({
        where: {
          name,
          enterpriseId: enterprise.id,
          role,
          NOT: { id },
        },
      })
      if (existingEquipament) {
        return c.json(
          { error: 'Já existe equipamento deste tipo com esse nome' },
          400,
        )
      }

      // TODO: Remove document

      const currentEquipament = await db.equipament.findUnique({
        where: { id, enterpriseId: enterprise.id },
        include: {
          inmetro: { select: { publicId: true } },
          datasheet: { select: { publicId: true } },
        },
      })
      if (!currentEquipament) {
        return c.json({ error: 'Equipamento não cadastrado' }, 404)
      }
      const currentInmetro = currentEquipament.inmetro
      const currentDatasheet = currentEquipament.datasheet

      if (currentInmetro) {
        if (
          (inmetro && inmetro.publicId !== currentInmetro.publicId) ||
          !inmetro
        ) {
          managerFile('equipaments', currentInmetro.publicId).catch((err) =>
            c.json({ error: err }, 400),
          )
        }
      }

      if (currentDatasheet) {
        if (
          (datasheet && datasheet.publicId !== currentDatasheet.publicId) ||
          !datasheet
        ) {
          managerFile('equipaments', currentDatasheet.publicId).catch((err) =>
            c.json({ error: err }, 400),
          )
        }
      }

      await db.equipament.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          name,
          role,
          ...values,
          inmetro:
            inmetro === null
              ? {
                  delete: currentInmetro ? true : undefined,
                }
              : inmetro
                ? {
                    upsert: {
                      create: {
                        id: createId(),
                        ...inmetro,
                      },
                      update: { ...inmetro },
                    },
                  }
                : undefined,
          datasheet:
            datasheet === null
              ? {
                  delete: currentDatasheet ? true : undefined,
                }
              : datasheet
                ? {
                    upsert: {
                      create: {
                        id: createId(),
                        ...datasheet,
                      },
                      update: { ...datasheet },
                    },
                  }
                : undefined,
        },
      })

      return c.json({ success: 'Material atualizado' }, 200)
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

      const data = await db.equipament.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Equipamento não cadastrado' }, 404)
      }

      return c.json({ success: 'Equipamento bloqueado' }, 200)
    },
  )

export default app
