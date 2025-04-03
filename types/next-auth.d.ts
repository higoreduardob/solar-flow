import { type DefaultSession, User } from 'next-auth'

import { UserRole } from '@prisma/client'

import { AddressFormValues } from '@/features/common/schema'

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  isTwoFactorEnabled?: boolean
  cpfCnpj: string | null
  whatsApp: string | null
  address: AddressFormValues
  status: boolean
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}

import { JWT } from '@auth/core/jwt'

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole
    isTwoFactorEnabled?: boolean
    cpfCnpj: string | null
    whatsApp: string | null
    address: AddressFormValues
    status: boolean
  }
}
