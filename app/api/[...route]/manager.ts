import { z } from 'zod'
import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { verifyAuth } from '@hono/auth-js'
import { createId } from '@paralleldrive/cuid2'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { statusFilter } from '@/lib/utils'
import { sendPasswordSignInEmail } from '@/lib/mail'
import { generateVerificationToken } from '@/lib/helpers'

import { signUpSchema, updateSchema } from '@/features/auth/schema'
import { insertEnterpriseSchema } from '@/features/enterprise/schema'
import { insertOwnerSchema } from '@/features/manager/schema'

const app = new Hono()
  .post(
    '/sign-up',
    verifyAuth(),
    zValidator('json', signUpSchema),
    async (c) => {
      const auth = c.get('authUser')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const {
        email,
        password,
        repeatPassword,
        hasAcceptedTerms,
        role,
        address,
        ...values
      } = validatedFields

      if (!hasAcceptedTerms)
        return c.json({ error: 'Termos são obrigatórios' }, 400)

      if (password !== repeatPassword)
        return c.json({ error: 'Senhas devem ser iguais' }, 400)

      const existingUser = await db.user.findUnique({
        where: { unique_email_per_role: { email, role } },
      })
      if (existingUser) return c.json({ error: 'Email já cadastrado' }, 400)

      const hashedPassword = await bcrypt.hash(password, 10)
      await db.user.create({
        data: {
          ...values,
          id: createId(),
          email,
          password: hashedPassword,
          hasAcceptedTerms,
          role,
          address: { create: { ...address } },
        },
      })
      const verificationToken = await generateVerificationToken(email)

      return c.json(
        {
          success: 'Cadastre a empresa do proprietário',
          token: verificationToken.token,
          password,
        },
        201,
      )
    },
  )
  .post(
    '/sign-up-enterprise',
    verifyAuth(),
    zValidator('json', insertEnterpriseSchema),
    zValidator(
      'query',
      z.object({
        token: z.string().optional(),
        password: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = c.get('authUser')
      const { token, password } = c.req.valid('query')
      const validatedFields = c.req.valid('json')

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      if (!token || !password) return c.json({ error: 'Usuário inválido' }, 400)

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { address, ...values } = validatedFields

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const existingUserToken = await db.verificationToken.findUnique({
        where: { token },
      })
      if (!existingUserToken)
        return c.json({ error: 'Usuário não cadastrado' }, 404)

      const hasExpired = new Date(existingUserToken.expires) < new Date()
      if (hasExpired) {
        return c.json({ error: 'Token expirado, faça o login novamente' }, 400)
      }

      const existingUser = await db.user.findUnique({
        where: {
          unique_email_per_role: {
            email: existingUserToken.email,
            role: 'OWNER',
          },
        },
      })
      if (!existingUser) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      await db.$transaction(async (tx) => {
        const data = await tx.enterprise.create({
          data: {
            id: createId(),
            ...values,
            address: { create: { ...address } },
          },
        })

        await tx.user.update({
          where: { id: existingUser.id },
          data: { selectedEnterprise: data.id },
        })

        await tx.enterpriseOwner.createMany({
          data: [{ userId: existingUser.id, enterpriseId: data.id }],
        })
      })

      await db.verificationToken.delete({
        where: { id: existingUserToken.id, token: existingUserToken.token },
      })

      await sendPasswordSignInEmail(existingUser.email, password)

      return c.json({ success: 'Empresa criada' }, 201)
    },
  )
  .post('/users', verifyAuth(), zValidator('json', signUpSchema), async (c) => {
    const auth = c.get('authUser')
    const validatedFields = c.req.valid('json')

    if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)

    if (!auth.token?.sub) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const user = await db.user.findUnique({ where: { id: auth.token.sub } })
    if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

    if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
      return c.json({ error: 'Usuário sem autorização' }, 401)
    }

    const {
      email,
      password,
      repeatPassword,
      hasAcceptedTerms,
      role,
      address,
      ...values
    } = validatedFields

    if (!hasAcceptedTerms)
      return c.json({ error: 'Termos são obrigatórios' }, 400)

    if (password !== repeatPassword)
      return c.json({ error: 'Senhas devem ser iguais' }, 400)

    const existingUser = await db.user.findUnique({
      where: { unique_email_per_role: { email, role } },
    })
    if (existingUser) return c.json({ error: 'Email já cadastrado' }, 400)

    const hashedPassword = await bcrypt.hash(password, 10)
    await db.user.create({
      data: {
        ...values,
        id: createId(),
        email,
        password: hashedPassword,
        hasAcceptedTerms,
        role,
        address: { create: { ...address } },
      },
    })
    await sendPasswordSignInEmail(email, password)

    return c.json({ success: 'Usuário criado' }, 201)
  })
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

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const roles: UserRole[] = role
        ? [role]
        : ['ADMINISTRATOR', 'OWNER', 'EMPLOYEE', 'MANAGER', 'CUSTOMER']

      const users = await db.user.findMany({
        where: {
          NOT: { id: user.id },
          role: { in: roles },
          status,
        },
        include: { address: true },
      })
      const data = users.map(({ password, ...rest }) => rest)

      return c.json({ data }, 200)
    },
  )
  .get('/enterprises', verifyAuth(), async (c) => {
    const auth = c.get('authUser')

    if (!auth.token?.sub) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const user = await db.user.findUnique({ where: { id: auth.token.sub } })
    if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

    if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
      return c.json({ error: 'Usuário sem autorização' }, 401)
    }

    const data = await db.enterprise.findMany({
      include: {
        address: true,
        owners: { select: { user: { select: { id: true, name: true } } } },
      },
    })

    return c.json({ data }, 200)
  })
  .get(
    '/enterprises/:id/documents',
    verifyAuth(),
    zValidator(
      'query',
      z.object({
        role: z.nativeEnum(UserRole).optional(),
      }),
    ),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const { role } = c.req.valid('query')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const enterprise = await db.enterprise.findUnique({
        where: { id },
      })
      if (!enterprise) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const roles: UserRole[] = role ? [role] : ['EMPLOYEE', 'MANAGER', 'OWNER']

      const data = await db.user.findMany({
        where: {
          role: { in: roles },
          status: true,
        },
        select: { id: true, name: true, cpfCnpj: true, whatsApp: true },
        orderBy: { name: 'asc' },
      })

      return c.json({ data }, 200)
    },
  )
  .get(
    '/enterprises/:id/owners',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.enterprise.findUnique({
        where: { id },
        select: {
          owners: { select: { user: { select: { id: true, name: true } } } },
        },
      })

      if (!data) {
        return c.json({ error: 'Empresa não cadastrada' }, 404)
      }

      return c.json({ data }, 200)
    },
  )
  .get(
    '/enterprises/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.enterprise.findUnique({
        where: { id },
        include: {
          address: true,
          owners: { select: { user: { select: { id: true, name: true } } } },
        },
      })

      if (!data) {
        return c.json({ error: 'Empresa não cadastrada' }, 404)
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

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.user.findUnique({
        where: { id },
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
  .post(
    '/bulk-delete',
    verifyAuth(),
    zValidator('json', z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = c.get('authUser')
      const { ids } = c.req.valid('json')

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      await db.user.updateMany({
        where: {
          id: { in: ids },
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

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.user.update({
        where: { id },
        data: { status: true },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      return c.json({ success: 'Usuário desbloqueado' }, 200)
    },
  )
  .patch(
    '/enterprises/:id/owners',
    verifyAuth(),
    zValidator('json', insertOwnerSchema),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { owners } = validatedFields

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const enterprise = await db.enterprise.findUnique({
        where: { id },
        select: { id: true, owners: { select: { userId: true } } },
      })

      if (!enterprise) {
        return c.json({ error: 'Empresa não cadastrada' }, 404)
      }

      const currentOwnerIds = new Set(
        enterprise.owners.map((owner) => owner.userId),
      )

      const ownersToAdd = owners.filter(
        (ownerId) => !currentOwnerIds.has(ownerId),
      )
      const ownersToRemove = Array.from(currentOwnerIds).filter(
        (ownerId) => !owners.includes(ownerId),
      )

      await db.$transaction(async (tx) => {
        if (ownersToRemove.length > 0) {
          await tx.enterpriseOwner.deleteMany({
            where: {
              enterpriseId: id,
              userId: { in: ownersToRemove },
            },
          })

          await tx.user.updateMany({
            where: {
              id: { in: ownersToRemove },
              selectedEnterprise: id,
            },
            data: {
              selectedEnterprise: null,
            },
          })
        }

        if (ownersToAdd.length > 0) {
          await tx.enterpriseOwner.createMany({
            data: ownersToAdd.map((ownerId) => ({
              userId: ownerId,
              enterpriseId: id,
            })),
            skipDuplicates: true,
          })

          for (const ownerId of ownersToAdd) {
            const ownerUser = await tx.user.findUnique({
              where: { id: ownerId },
              select: { selectedEnterprise: true },
            })

            if (!ownerUser?.selectedEnterprise) {
              await tx.user.update({
                where: { id: ownerId },
                data: { selectedEnterprise: id },
              })
            }
          }
        }
      })

      return c.json({ success: 'Empresa atualizada' }, 200)
    },
  )
  .patch(
    '/enterprises/:id',
    verifyAuth(),
    zValidator('json', insertEnterpriseSchema),
    zValidator('param', z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { address, ...values } = validatedFields

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      await db.enterprise.update({
        where: { id },
        data: {
          ...values,
          address: {
            upsert: {
              create: { ...address },
              update: { ...address },
            },
          },
        },
      })

      return c.json({ success: 'Empresa atualizada' }, 200)
    },
  )
  .patch(
    '/:id',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', updateSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { address, documents, ...values } = validatedFields

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.user.update({
        where: { id },
        data: {
          ...values,
          address: {
            upsert: {
              create: { ...address },
              update: { ...address },
            },
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

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (![UserRole.ADMINISTRATOR as string].includes(user.role)) {
        return c.json({ error: 'Usuário sem autorização' }, 401)
      }

      const data = await db.user.update({
        where: { id },
        data: { status: false },
      })

      if (!data) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      return c.json({ success: 'Usuário bloqueado' }, 200)
    },
  )

export default app
