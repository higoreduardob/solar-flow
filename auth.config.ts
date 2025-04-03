import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { db } from '@/lib/db'

import { signInSchema } from '@/features/auth/schema'

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = signInSchema.safeParse(credentials)

        if (!validatedFields.success) return null
        const { email, password, role } = validatedFields.data

        const existingUser = await db.user.findUnique({
          where: {
            unique_email_per_role: { email, role },
          },
        })

        if (!existingUser || !existingUser.password) return null

        const passwordsMatch = await bcrypt.compare(
          password,
          existingUser.password,
        )
        if (passwordsMatch) return existingUser

        return null
      },
    }),
  ],
} satisfies NextAuthConfig
