import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { insertTransactionSchema } from '@/features/works/transactions/schema'
import { filterFiles, managerFile } from '@/lib/cloudinary'

const app = new Hono()
  .get(
    '/works/:workId',
    verifyAuth(),
    zValidator('param', z.object({ workId: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { workId } = c.req.valid('param')

      if (!workId) {
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

      const work = await db.work.findUnique({
        where: { id: workId, enterpriseId: enterprise.id },
      })
      if (!work) return c.json({ error: 'Obra não encontrada' }, 404)

      const [incomes, expenses] = await db.$transaction([
        db.transaction.findMany({
          where: {
            amount: { gte: 0 },
            workId: work.id,
            enterpriseId: enterprise.id,
          },
          include: {
            work: { select: { role: true } },
            documents: true,
          },
        }),
        db.transaction.findMany({
          where: {
            amount: { lt: 0 },
            workId: work.id,
            enterpriseId: enterprise.id,
          },
          include: {
            work: { select: { role: true } },
            documents: true,
          },
        }),
      ])

      return c.json({ data: { incomes, expenses, role: work.role } }, 200)
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

      const data = await db.transaction.findUnique({
        where: { id, enterpriseId: enterprise.id },
        include: {
          work: { select: { role: true } },
          documents: true,
        },
      })

      if (!data) {
        return c.json({ error: 'Transação não cadastrada' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .post(
    '/works/:workId',
    verifyAuth(),
    zValidator('param', z.object({ workId: z.string().optional() })),
    zValidator('json', insertTransactionSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { workId } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!workId) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { documents, ...values } = validatedFields

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

      const work = await db.work.findUnique({
        where: { id: workId, enterpriseId: enterprise.id },
      })
      if (!work) return c.json({ error: 'Obra não encontrada' }, 404)

      await db.transaction.create({
        data: {
          id: createId(),
          ...values,
          enterprise: {
            connect: { id: enterprise.id },
          },
          work: {
            connect: { id: work.id },
          },
          documents: { createMany: { data: documents || [] } },
        },
      })

      return c.json({ success: 'Transação criada' }, 201)
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

      const documentsToRemove = await db.transaction.findMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
        select: { documents: { select: { publicId: true } } },
      })

      if (!!documentsToRemove.length) {
        const publicIds = documentsToRemove.flatMap((transaction) =>
          transaction.documents.map((doc) => doc.publicId),
        )

        await Promise.all(
          publicIds.map(async (item) =>
            managerFile('transactions', item).catch((err) =>
              c.json({ error: err }, 400),
            ),
          ),
        )
      }

      await db.work.deleteMany({
        where: { id: { in: ids }, enterpriseId: enterprise.id },
      })

      return c.json({ success: 'Transações excluídas' }, 200)
    },
  )
  .patch(
    '/:id/works/:workId',
    verifyAuth(),
    zValidator(
      'param',
      z.object({ id: z.string().optional(), workId: z.string().optional() }),
    ),
    zValidator('json', insertTransactionSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id, workId } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { documents, ...values } = validatedFields

      if (!id || !workId) {
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

      const work = await db.work.findUnique({
        where: { id: workId, enterpriseId: enterprise.id },
      })
      if (!work) return c.json({ error: 'Obra não encontrada' }, 404)

      const currentDocumentIds = await db.transaction.findUnique({
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
            managerFile('transactions', item).catch((err) =>
              c.json({ error: err }, 400),
            ),
          ),
        )
      }

      await db.transaction.update({
        where: { id, enterpriseId: enterprise.id, workId: work.id },
        data: {
          ...values,
          documents: {
            deleteMany: { id: { in: toRemove } },
            createMany: { data: toAdd || [] },
          },
        },
      })

      return c.json({ success: 'Transação atualizada' }, 200)
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

      const currentDocumentIds = await db.transaction.findUnique({
        where: { id, enterpriseId: enterprise.id },
        select: { documents: { select: { publicId: true } } },
      })

      const toRemove = currentDocumentIds?.documents.map(
        (document) => document.publicId,
      )

      if (toRemove && !!toRemove.length) {
        await Promise.all(
          toRemove.map(async (item) =>
            managerFile('transactions', item).catch((err) =>
              c.json({ error: err }, 400),
            ),
          ),
        )
      }

      const data = await db.transaction.delete({
        where: { id, enterpriseId: enterprise.id },
      })

      if (!data) {
        return c.json({ error: 'Transação não cadastrada' }, 404)
      }

      return c.json({ success: 'Transação excluída' }, 200)
    },
  )

export default app
