import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { db } from '@/lib/db'

import authConfig from '@/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/entrar',
  },
  callbacks: {
    async signIn({ user }) {
      const existingUser = await db.user.findUnique({ where: { id: user.id! } })

      if (!existingUser) return false

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique(
          {
            where: { userId: existingUser.id },
          },
        )
        if (!twoFactorConfirmation) return false

        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        })
      }

      return true
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (session.user) {
        session.user.name = token.name
        session.user.role = token.role
        session.user.whatsApp = token.whatsApp
        session.user.cpfCnpj = token.cpfCnpj
        session.user.address = token.address
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled
        session.user.status = token.status
        session.user.selectedEnterprise = token.selectedEnterprise
        session.user.documents = token.documents
      }

      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await db.user.findUnique({
        where: { id: token.sub },
        include: {
          address: {
            select: {
              zipCode: true,
              street: true,
              neighborhood: true,
              city: true,
              state: true,
              number: true,
              complement: true,
            },
          },
          enterprise: {
            select: {
              id: true,
              name: true,
            },
          },
          documents: {
            select: {
              name: true,
              url: true,
              publicId: true,
              type: true,
              size: true,
            },
          },
        },
      })

      if (!existingUser) return token

      token.name = existingUser.name
      token.role = existingUser.role
      token.whatsApp = existingUser.whatsApp
      token.cpfCnpj = existingUser.cpfCnpj
      token.address = existingUser.address!
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
      token.status = existingUser.status
      token.selectedEnterprise = existingUser.enterprise
      token.documents = existingUser.documents

      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
