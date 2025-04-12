import { z } from 'zod'
import { Hono } from 'hono'
import { verifyAuth } from '@hono/auth-js'
import { zValidator } from '@hono/zod-validator'

import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { uploadFile } from '@/lib/cloudinary'

import {
  insertFileSchema,
  insertMultipleFileSchema,
} from '@/features/common/schema'

const app = new Hono()
  .post(
    '/file',
    verifyAuth(),
    zValidator('query', z.object({ folder: z.string().optional() })),
    zValidator('form', insertFileSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { folder } = c.req.valid('query')

      if (!folder) {
        return c.json({ error: 'Falha para salvar a imagem' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![
          UserRole.ADMINISTRATOR as string,
          UserRole.OWNER as string,
          UserRole.MANAGER as string,
          UserRole.EMPLOYEE as string,
        ].includes(user.role)
      ) {
        return c.json({ error: 'Usuário sem autorização' }, 400)
      }

      const formData = await c.req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return c.json({ error: 'Nenhum arquivo enviado' }, 400)
      }

      // console.log('Arquivo recebido:', file.name, file.type, file.size)
      const result = await uploadFile(file, folder)
      return c.json({ data: { ...result } }, 200)
    },
  )
  .post(
    '/files',
    verifyAuth(),
    zValidator('query', z.object({ folder: z.string().optional() })),
    zValidator('form', insertMultipleFileSchema),
    async (c) => {
      const auth = c.get('authUser')
      const { folder } = c.req.valid('query')

      if (!folder) {
        return c.json({ error: 'Falha para salvar a imagem' }, 400)
      }

      if (!auth.token?.sub) {
        return c.json({ error: 'Usuário não autorizado' }, 401)
      }

      const user = await db.user.findUnique({ where: { id: auth.token.sub } })
      if (!user) return c.json({ error: 'Usuário não autorizado' }, 401)

      if (
        ![
          UserRole.ADMINISTRATOR as string,
          UserRole.OWNER as string,
          UserRole.MANAGER as string,
          UserRole.EMPLOYEE as string,
        ].includes(user.role)
      ) {
        return c.json({ error: 'Usuário sem autorização' }, 400)
      }

      const formData = await c.req.formData()
      const filesEntries = formData.getAll('files')

      if (!filesEntries || filesEntries.length === 0) {
        return c.json({ error: 'Nenhum arquivo enviado' }, 400)
      }

      const files = filesEntries.filter(
        (entry) => entry instanceof File,
      ) as File[]

      if (files.length === 0) {
        return c.json({ error: 'Nenhum arquivo válido enviado' }, 400)
      }

      const results = await Promise.all(
        files.map(async (file) => await uploadFile(file, folder)),
      )

      return c.json({ data: { ...results } }, 200)
    },
  )

export default app
