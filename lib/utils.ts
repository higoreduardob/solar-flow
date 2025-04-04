import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'
import { ExtendedUser } from '@/types/next-auth'

import { UpdateFormValues } from '@/features/auth/schema'
import { AddressFormValues } from '@/features/common/schema'

import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formattedAddress(address: AddressFormValues | null) {
  return {
    street: address?.street || '',
    neighborhood: address?.neighborhood || '',
    city: address?.city || '',
    state: address?.state || '',
    number: address?.number || '',
    zipCode: address?.zipCode ? zipCodeMask(address.zipCode) : '',
    complement: address?.complement || '',
  }
}

export function mapSessionToUpdateData(sessionUser: ExtendedUser) {
  const { name, email, role, whatsApp, cpfCnpj, address } = sessionUser

  const updateData = {
    name,
    email,
    role,
    whatsApp: phoneMask(whatsApp),
    cpfCnpj: cpfCnpjMask(cpfCnpj),
    address: formattedAddress(address),
  }

  return updateData as UpdateFormValues
}

export function createEnumOptions<T extends string>(
  enumObject: Record<T, string | number>,
  translateFunction: (key: T) => string,
): {
  label: string | any
  value: string | any
}[] {
  return Object.keys(enumObject).map((key) => ({
    label: translateFunction(key as T),
    value: key,
  }))
}

export function generateStrongPassword(length: number = 10): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+{}[]|:;<>,.?/~'

  const allChars = uppercase + lowercase + numbers + symbols

  let password = ''

  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  return password
}

export function statusFilter(status?: string) {
  if (status === undefined) {
    return undefined
  }

  const regex = /^\s*(true|1|on)\s*$/i
  return regex.test(status)
}
