import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { Prisma, UserRole, WorkRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'

import { insertWorkSchema } from '@/features/works/schema'
import { insertTeamInWorkSchema } from '@/features/works/teams/schema'
import { insertMaterialInWorkSchema } from '@/features/works/materials/schema'
import { insertEquipamentInWorkSchema } from '@/features/works/equipaments/schema'
import { insertDocumentInWorkSchema } from '@/features/works/documents/schema'
import { filterFiles, managerFile } from '@/lib/cloudinary'

type EnhancedWorkData = {
  id: string
  cod: number
  amount: number
  circuitBreaker: number | null
  uc: string | null
  isAddressCustomer: boolean
  coordinates: string | null
  xLat: string | null
  yLat: string | null
  lat: string | null
  long: string | null
  obs: string | null
  status: boolean
  role: WorkRole
  orderDate: Date | null
  equipamentArrivalDate: Date | null
  startDateOfWork: Date | null
  approvalDate: Date | null
  deliveryDate: Date | null
  createdAt: Date
  updatedAt: Date
  enterpriseId: string
  customerId: string
  responsibleId: string
  designerId: string
  customer: string
  whatsApp: string
  expenses: number
  incomes: number
  remaining: number
}

const app = new Hono()
  .get(
    '/',
    verifyAuth(),
    zValidator(
      'query',
      z.object({
        role: z.nativeEnum(WorkRole).optional(),
        status: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { role, status: statusValue, from, to } = c.req.valid('query')

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

      const data = await db.$queryRaw<EnhancedWorkData[]>(
        Prisma.sql`
            WITH work_base AS (
              SELECT 
                w.*,
                u.name as customer,
                u."whatsApp" as "whatsApp"
              FROM "Work" w
              LEFT JOIN "User" u ON w."customerId" = u.id
              WHERE w."enterpriseId" = ${enterprise.id}
              ${status !== undefined ? Prisma.sql`AND w.status = ${status}` : Prisma.sql``}
              ${role ? Prisma.sql`AND w.role::text = ${role.toString()}` : Prisma.sql``}
              ${from ? Prisma.sql`AND w."createdAt" >= ${from}::timestamp` : Prisma.sql``}
              ${to ? Prisma.sql`AND w."createdAt" <= ${to}::timestamp` : Prisma.sql``}
            ),
            financial_data AS (
              SELECT 
                w.id as "workId",
                (COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) - 
                 COALESCE((SELECT SUM(wm.amount) FROM "WorkMaterial" wm WHERE wm."workId" = w.id), 0))::float as expenses,
                COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0)::float as incomes,
                (COALESCE(SUM(t.amount), 0) - 
                 COALESCE((SELECT SUM(wm.amount) FROM "WorkMaterial" wm WHERE wm."workId" = w.id), 0))::float as remaining
              FROM "Work" w
              LEFT JOIN "Transaction" t ON w.id = t."workId"
              GROUP BY w.id
            )
            SELECT 
              wb.*,
              COALESCE(fd.expenses, 0) as expenses,
              COALESCE(fd.incomes, 0) as incomes,
              COALESCE(fd.remaining, 0) as remaining
            FROM work_base wb
            LEFT JOIN financial_data fd ON wb.id = fd."workId"
            ORDER BY wb."createdAt" ASC
          `,
      )

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
    '/:id/documents',
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
          documents: true,
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
    '/:id/teams',
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
          teams: true,
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
    '/:id/materials',
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

      // TODO: Get workMaterial, fazer tb no equipaments tanto get como patch

      const data = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: {
          materials: {
            include: {
              work: { select: { role: true } },
              material: {
                select: { name: true, measure: { select: { name: true } } },
              },
            },
          },
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
    '/:id/materials/:materialId',
    verifyAuth(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
        materialId: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { id, materialId } = c.req.valid('param')

      if (!id || !materialId) {
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

      const data = await db.workMaterial.findUnique({
        where: { workId_materialId: { workId: id, materialId } },
        select: {
          materialId: true,
          amount: true,
          quantity: true,
          work: { select: { role: true } },
        },
      })

      if (!data) {
        return c.json({ error: 'Material não cadastrado' }, 404)
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
  .post(
    '/:id/materials',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertMaterialInWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)

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

      // TODO: calculate amount
      const exists = await db.workMaterial.findUnique({
        where: {
          workId_materialId: {
            workId: id,
            materialId: validatedFields.materialId,
          },
        },
      })

      if (exists) {
        return c.json({ error: 'Material já adicionado a esta obra' }, 409)
      }

      // TODO: Improve performance

      await Promise.all([
        db.workMaterial.create({
          data: { ...validatedFields, workId: id },
        }),
        db.material.update({
          where: { id: validatedFields.materialId },
          data: { stock: { decrement: validatedFields.quantity } },
        }),
      ])

      return c.json({ success: 'Obra atualizada' }, 200)
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
    '/:id/documents',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertDocumentInWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { documents } = validatedFields

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

      const currentDocumentIds = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: { documents: { select: { publicId: true } } },
      })

      const { toAdd, toRemove } = await filterFiles(
        documents,
        currentDocumentIds?.documents,
      )

      if (toRemove && toRemove.length > 0) {
        await Promise.all(
          toRemove.map(async (item) =>
            managerFile('documents', item).catch((err) =>
              c.json({ error: err }, 400),
            ),
          ),
        )
      }

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          documents: {
            deleteMany: { publicId: { in: toRemove } },
            createMany: { data: toAdd || [] },
          },
        },
      })

      return c.json({ success: 'Obra atualizada' }, 200)
    },
  )
  .patch(
    '/:id/teams',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', insertTeamInWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { teams } = validatedFields

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

      const currentTeams = await db.work.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: {
          teams: { select: { teamId: true } },
        },
      })
      const assetIds = new Set(teams)
      const teamIds = new Set(currentTeams?.teams.map((team) => team.teamId))

      const [toAdd, toRemove] = await Promise.all([
        teams
          ?.filter((team) => !teamIds.has(team))
          .map((team) => ({ teamId: team })),
        currentTeams?.teams
          .filter((team) => !assetIds.has(team.teamId))
          .map((team) => team.teamId),
      ])

      await db.work.update({
        where: { id, enterpriseId: enterprise.id },
        data: {
          teams: {
            deleteMany: { teamId: { in: toRemove } },
            createMany: { data: toAdd || [] },
          },
        },
      })

      return c.json({ success: 'Obra atualizada' }, 200)
    },
  )
  .patch(
    '/:id/materials/:materialId',
    verifyAuth(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
        materialId: z.string().optional(),
      }),
    ),
    zValidator('json', insertMaterialInWorkSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id, materialId } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)

      if (!id || !materialId) {
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

      const currentMaterial = await db.workMaterial.findUnique({
        where: { workId_materialId: { materialId, workId: id } },
        select: { quantity: true },
      })
      if (!currentMaterial)
        return c.json({ error: 'Material não cadastrado' }, 400)

      // TODO: Calculate avg amount
      const stock = validatedFields.quantity - currentMaterial.quantity

      await Promise.all([
        db.workMaterial.update({
          where: { workId_materialId: { materialId, workId: id } },
          data: { ...validatedFields },
        }),
        db.material.update({
          where: { id: materialId },
          data: { stock: { decrement: stock } },
        }),
      ])

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
    '/:id/materials/:materialId',
    verifyAuth(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional(),
        materialId: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { id, materialId } = c.req.valid('param')

      if (!id || !materialId) {
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

      // TODO: Improve this
      const data = await db.workMaterial.delete({
        where: { workId_materialId: { workId: id, materialId } },
      })

      await db.material.update({
        where: { id: materialId },
        data: { stock: { increment: data.quantity } },
      })

      return c.json({ success: 'Material removido' }, 200)
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
