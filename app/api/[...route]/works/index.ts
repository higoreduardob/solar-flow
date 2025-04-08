import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'

import { insertWorkSchema } from '@/features/works/schema'
import { insertEquipamentInWorkSchema } from '@/features/works/equipaments/schema'

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

      const data = await db.work.findMany({
        where: { enterpriseId: enterprise.id, status },
        include: { customer: { select: { name: true, whatsApp: true } } },
        orderBy: { createdAt: 'asc' },
      })

      return c.json({ data }, 200)
    },
  )
  .get(
    '/:id/equipaments',
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

      const data = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: {
          equipaments: true,
          role: true,
        },
      })

      if (!data) {
        return c.json({ error: 'Obra não cadastrada' }, 404)
      }

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

      const data = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        include: {
          address: true,
          customer: { select: { id: true } },
          responsible: { select: { id: true } },
          designer: { select: { id: true } },
        },
      })

      if (!data) {
        return c.json({ error: 'Obra não cadastrada' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .post('/', verifyAuth(), zValidator('json', insertWorkSchema), async (c) => {
    const auth = c.get('authUser')
    const validatedFields = c.req.valid('json')

    if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
    const {
      address,
      isAddressCustomer,
      customerId,
      responsibleId,
      designerId,
      ...values
    } = validatedFields

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

    const customer = await db.user.findUnique({
      where: { id: customerId, enterpriseBelongId: enterprise.id },
      select: {
        address: {
          omit: { id: true, enterpriseId: true, userId: true, workId: true },
        },
      },
    })
    const customerAddress = customer?.address
    if (!customer || !customerAddress)
      return c.json({ error: 'Cliente não cadastrado' }, 400)

    await db.work.create({
      data: {
        id: createId(),
        ...values,
        isAddressCustomer,
        enterprise: {
          connect: { id: enterprise.id },
        },
        customer: {
          connect: { id: customerId },
        },
        responsible: {
          connect: { id: responsibleId },
        },
        designer: {
          connect: { id: designerId },
        },
        ...(!isAddressCustomer && address
          ? {
              address: {
                create: { ...address },
              },
            }
          : { address: { create: { ...customerAddress } } }),
      },
    })

    return c.json({ success: 'Obra criada' }, 201)
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

      await db.work.updateMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
        data: { status: false },
      })

      return c.json({ success: 'Obras bloqueadas' }, 200)
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

      const data = await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Obra não cadastrada' }, 404)
      }

      return c.json({ success: 'Obra desbloqueada' }, 200)
    },
  )
  .patch(
    '/:id/canceled',
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

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: { role: 'CANCELLED' },
      })

      return c.json({ success: 'Obra cancelada' }, 200)
    },
  )
  .patch(
    '/:id/completed',
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

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: { role: 'COMPLETED' },
      })

      return c.json({ success: 'Obra entregue' }, 200)
    },
  )
  .patch(
    '/:id/equipaments',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertEquipamentInWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { equipaments } = validatedFields

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

      const currentEquipaments = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: {
          equipaments: { select: { equipamentId: true, quantity: true } },
        },
      })
      const assetIds = new Set(
        equipaments.map((equipament) => equipament.equipamentId),
      )
      const equipamentIds = new Set(
        currentEquipaments?.equipaments.map(
          (equipament) => equipament.equipamentId,
        ),
      )
      const currentEquipamentMaps = new Map(
        currentEquipaments?.equipaments.map((e) => [
          e.equipamentId,
          e.quantity,
        ]),
      )
      const salesEquipamentUpdates = []

      const [toAdd, toRemove] = await Promise.all([
        equipaments?.filter(
          (equipament) => !equipamentIds.has(equipament.equipamentId),
        ),
        currentEquipaments?.equipaments
          .filter((equipament) => !assetIds.has(equipament.equipamentId))
          .map((equipament) => equipament.equipamentId),
      ])

      if (equipaments && equipaments.length > 0) {
        for (const { equipamentId, quantity } of equipaments) {
          const current = currentEquipamentMaps.get(equipamentId) || 0
          const diff = quantity - current

          salesEquipamentUpdates.push(
            db.equipament.update({
              where: { id: equipamentId },
              data: { sales: { increment: diff } },
            }),
          )

          currentEquipamentMaps.delete(equipamentId)
        }

        for (const [equipamentId, quantity] of currentEquipamentMaps) {
          salesEquipamentUpdates.push(
            db.equipament.update({
              where: { id: equipamentId },
              data: { sales: { decrement: quantity } },
            }),
          )
        }

        await Promise.all(salesEquipamentUpdates)
      }

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          equipaments: {
            deleteMany: { equipamentId: { in: toRemove } },
            createMany: { data: toAdd || [] },
          },
        },
      })

      return c.json({ success: 'Obra atualizada' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const {
        address,
        isAddressCustomer,
        customerId,
        responsibleId,
        designerId,
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

      const customer = await db.user.findUnique({
        where: { id: customerId, enterpriseBelongId: enterprise.id },
        select: {
          address: {
            omit: { id: true, enterpriseId: true, userId: true, workId: true },
          },
        },
      })
      const customerAddress = customer?.address
      if (!customer || !customerAddress)
        return c.json({ error: 'Cliente não cadastrado' }, 400)

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          ...values,
          isAddressCustomer,
          enterprise: {
            connect: { id: enterprise.id },
          },
          customer: {
            connect: { id: customerId },
          },
          responsible: {
            connect: { id: responsibleId },
          },
          designer: {
            connect: { id: designerId },
          },
          ...(!isAddressCustomer && address
            ? {
                address: {
                  upsert: {
                    create: { ...address },
                    update: { ...address },
                  },
                },
              }
            : {
                address: {
                  upsert: {
                    create: { ...customerAddress },
                    update: { ...customerAddress },
                  },
                },
              }),
        },
      })

      return c.json({ success: 'Obra atualizada' }, 200)
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

      const data = await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Obra não cadastrada' }, 404)
      }

      return c.json({ success: 'Obra bloqueada' }, 200)
    },
  )

export default app
