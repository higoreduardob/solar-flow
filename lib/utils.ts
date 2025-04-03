import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'
import { ExtendedUser } from '@/types/next-auth'

import { UpdateFormValues } from '@/features/auth/schema'
import { AddressFormValues } from '@/features/common/schema'

import { cpfCnpjMask, phoneMask, zipCodeMask } from '@/lib/format'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formattedAddress(address?: AddressFormValues) {
  return {
    street: address?.street || '',
    neighborhood: address?.neighborhood,
    city: address?.city,
    state: address?.state,
    number: address?.number,
    zipCode: address?.zipCode ? zipCodeMask(address.zipCode) : '',
    complement: address?.complement,
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
