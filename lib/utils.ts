import { twMerge } from 'tailwind-merge'
import { ptBR } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import { clsx, type ClassValue } from 'clsx'
import { ExtendedUser } from '@/types/next-auth'
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns'

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
  const regex = /^\s*(true|1|on)\s*$/i
  return status !== 'none' ? regex.test(status!) : undefined
}

export function convertAmountFromMiliunits(amount: number | null) {
  if (!amount) return 0

  return amount / 1000
}

export function convertAmountToMiliunits(
  amount: number | string | undefined | null,
) {
  if (!amount) return 0

  const currAmount =
    typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '.')) : amount

  return Math.round(currAmount * 1000)
}

export function formatValue(
  value: number,
  options?: {
    isCurrency?: boolean
    unit?: UnitIdentifier
    fractionDigits?: number
  },
) {
  const { isCurrency = false, unit, fractionDigits } = options ?? {}

  const formatOptions: Intl.NumberFormatOptions = isCurrency
    ? {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: fractionDigits ?? 2,
        maximumFractionDigits: fractionDigits ?? 2,
      }
    : unit
      ? {
          style: 'unit',
          unit,
          unitDisplay: 'short',
          minimumFractionDigits: fractionDigits ?? 0,
          maximumFractionDigits: fractionDigits ?? 0,
        }
      : {
          style: 'decimal',
          minimumFractionDigits: fractionDigits ?? 0,
          maximumFractionDigits: fractionDigits ?? 0,
        }

  return Intl.NumberFormat('pt-BR', formatOptions).format(value)
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100
  }

  return ((previous - current) / previous) * 100
}

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false },
) {
  const result = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
  }).format(value / 100)

  if (options.addPrefix && value > 0) {
    return `+${result}`
  }

  return result
}

export function formatDateRange(period?: Period) {
  const defaultTo = new Date()
  const defaultFrom = subDays(defaultTo, 30)

  if (!period?.from) {
    return `${capitalizeFirstLetter(
      format(defaultFrom, 'LLL dd', { locale: ptBR }),
    )} - ${capitalizeFirstLetter(
      format(defaultTo, 'LLL dd, y', { locale: ptBR }),
    )}`
  }

  if (period.to) {
    return `${capitalizeFirstLetter(
      format(toZonedTime(period.from, 'UTC'), 'LLL dd', { locale: ptBR }),
    )} - ${capitalizeFirstLetter(
      format(toZonedTime(period.to, 'UTC'), 'LLL dd, y', { locale: ptBR }),
    )}`
  }

  return capitalizeFirstLetter(
    format(toZonedTime(period.from, 'UTC'), 'LLL dd, y', { locale: ptBR }),
  )
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function fillMissingDays(
  data: VariantProps['data'],
  startDate: Date,
  endDate: Date,
) {
  if (data.length === 0) {
    return []
  }

  const keys = new Set<string>()
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'date') {
        keys.add(key)
      }
    })
  })

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const transactionsByDay = allDays.map((day) => {
    const found = data.find((d) =>
      isSameDay(new Date(d.date + 'T00:00:00'), day),
    )

    if (found) {
      return { ...found, date: day.toISOString().split('T')[0] }
    } else {
      const emptyEntry: Record<string, number | string> = {
        date: day.toISOString().split('T')[0],
      }
      keys.forEach((key) => {
        emptyEntry[key] = 0
      })
      return emptyEntry
    }
  })

  return transactionsByDay
}
