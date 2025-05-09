import { z } from 'zod'
import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { AuthError } from 'next-auth'
import { verifyAuth } from '@hono/auth-js'
import { zValidator } from '@hono/zod-validator'

import {
  generateTwoFactorToken,
  getTwoFactorConfirmationByUserId,
  getTwoFactorTokenByEmail,
} from '@/lib/helpers'
import { db } from '@/lib/db'
import { sendPasswordResetEmail, sendTwoFactorTokenEmail } from '@/lib/mail'

import { signIn } from '@/auth'

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  updatePasswordSchema,
  updateSchema,
} from '@/features/auth/schema'
import { filterFiles, managerFile } from '@/lib/cloudinary'

const app = new Hono()
  .post('/sign-in/validate', verifyAuth(), async (c) => {
    const auth = c.get('authUser')

    if (!auth.token?.sub) {
      return c.json({ error: 'Usuário não autorizado' }, 401)
    }

    const user = await db.user.findUnique({
      where: { id: auth.token.sub, status: true },
    })
    if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

    return c.json({ success: !!user })
  })
  .post('/sign-in', zValidator('json', signInSchema), async (c) => {
    const validatedFields = c.req.valid('json')

    if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
    const { email, password, code, role } = validatedFields

    const existingUser = await db.user.findUnique({
      where: {
        unique_email_per_role: { email, role },
      },
    })
    if (!existingUser || !existingUser.email || !existingUser.password) {
      return c.json({ error: 'Email não cadastrado' }, 400)
    }

    if (!existingUser.status) {
      return c.json({ error: 'Acesso não permitido' }, 400)
    }

    if (!code) {
      const passwordsMatch = await bcrypt.compare(
        password,
        existingUser.password,
      )
      if (!passwordsMatch) {
        return c.json({ error: 'Email e/ou senha inválidos' }, 400)
      }
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      if (code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(
          existingUser.email,
        )
        if (!twoFactorToken) {
          return c.json({ error: 'Código inválido' }, 400)
        }

        if (twoFactorToken.token !== code) {
          return c.json({ error: 'Código inválido' }, 400)
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date()
        if (hasExpired) {
          return c.json({ error: 'Código expirado' }, 400)
        }

        await db.twoFactorToken.delete({
          where: { id: twoFactorToken.id },
        })

        const existingConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id,
        )
        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id },
          })
        }

        await db.twoFactorConfirmation.create({
          data: { userId: existingUser.id },
        })
      } else {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email)
        await sendTwoFactorTokenEmail(
          twoFactorToken.email,
          twoFactorToken.token,
        )

        return c.json(
          {
            success: 'Informe o código enviado ao seu email',
            twoFactor: true,
          },
          200,
        )
      }
    }

    try {
      await signIn('credentials', {
        email,
        password,
        role,
        redirect: false,
      })

      return c.json(
        {
          success: 'Login realizado com sucesso',
          redirect: role === 'ADMINISTRATOR' ? '/gestao' : '/plataforma',
          update: true,
        },
        200,
      )
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return c.json({ error: 'Email e/ou senha inválidos' }, 400)
          default:
            return c.json(
              { error: 'Erro inesperado, contate o administrador' },
              500,
            )
        }
      }

      throw error
    }
  })
  .post(
    '/forgot-password',
    zValidator('json', forgotPasswordSchema),
    async (c) => {
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { email, role } = validatedFields

      const existingUser = await db.user.findUnique({
        where: {
          unique_email_per_role: { email, role },
        },
      })
      if (!existingUser) return c.json({ error: 'Usuário não cadastrado' }, 404)

      const token = uuidv4()
      const expires = new Date(new Date().getTime() + 3600 * 1000)
      const existingToken = await db.passwordResetToken.findFirst({
        where: { email },
      })

      if (existingToken) {
        await db.passwordResetToken.delete({
          where: { id: existingToken.id },
        })
      }

      const passwordResetToken = await db.passwordResetToken.create({
        data: {
          email,
          token,
          expires,
        },
      })

      await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
      )

      return c.json(
        { success: 'Acesse seu email para redefinir sua senha' },
        200,
      )
    },
  )
  .post(
    '/reset-password',
    zValidator('json', resetPasswordSchema),
    zValidator(
      'query',
      z.object({
        token: z.string().optional(),
      }),
    ),
    async (c) => {
      const validatedFields = c.req.valid('json')
      const { token } = c.req.valid('query')

      if (!token) return c.json({ error: 'Token inválido' }, 400)

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { password, repeatPassword, role } = validatedFields

      if (password !== repeatPassword)
        return c.json({ error: 'Senhas devem ser iguais' }, 400)

      const existingToken = await db.passwordResetToken.findUnique({
        where: { token },
      })
      if (!existingToken) {
        return c.json({ error: 'Token inválido' }, 400)
      }

      const hasExpired = new Date(existingToken.expires) < new Date()
      if (hasExpired) {
        return c.json({ error: 'Token expirado' }, 400)
      }

      const existingUser = await db.user.findUnique({
        where: {
          unique_email_per_role: { email: existingToken.email, role },
        },
      })
      if (!existingUser) {
        return c.json({ error: 'Usuário não cadastrado' }, 404)
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      await db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      })

      await db.passwordResetToken.delete({
        where: { id: existingToken.id },
      })

      return c.json({ success: 'Senha redefinida com sucesso' }, 200)
    },
  )
  .patch(
    '/:id/update-password',
    verifyAuth(),
    zValidator('param', z.object({ id: z.string().optional() })),
    zValidator('json', updatePasswordSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { id } = c.req.valid('param')
      const validatedFields = c.req.valid('json')

      if (!validatedFields) return c.json({ error: 'Campos inválidos' }, 400)
      const { password, newPassword, repeatPassword } = validatedFields

      if (newPassword !== repeatPassword)
        return c.json({ error: 'Senhas devem ser iguais' }, 400)

      if (!id) {
        return c.json({ error: 'Identificador não encontrado' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      if (auth.token.sub !== id) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({
        where: { id: auth.token.sub },
      })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (!user.password) {
        return c.json({ error: 'Informações inválidas' }, 400)
      }

      const isConfirm = bcrypt.compareSync(password, user.password)
      if (!isConfirm) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      return c.json({ success: 'Senha alterada' }, 200)
    },
  )
  .patch(
    '/:id/update-2fa',
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

      if (auth.token.sub !== id) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({
        where: { id: auth.token.sub },
      })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      await db.user.update({
        where: { id: user.id },
        data: {
          isTwoFactorEnabled: !user.isTwoFactorEnabled,
        },
      })

      return c.json({ success: 'Autenticação de dois fatores atualizada' }, 200)
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

      if (!auth.token?.sub || auth.token.sub !== id) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({
        where: { id: auth.token.sub },
      })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      const currentDocumentIds = await db.user.findUnique({
        where: { id: user.id },
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

      await db.user.update({
        where: { id: user.id },
        data: {
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

      return c.json({ success: 'Dados pessoais atualizados' }, 200)
    },
  )

export default app
