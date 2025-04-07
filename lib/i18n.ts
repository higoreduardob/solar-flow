import { EquipamentRole, UserRole, WorkRole } from '@prisma/client'

export function translatePasswordOptionsProps(option: PasswordOptionsProps) {
  switch (option) {
    case 'STRONG':
      return 'Forte'
    case 'GOOD':
      return 'Bom'
    default:
      return 'Fraca'
  }
}

export function translateUserRole(role: UserRole) {
  switch (role) {
    case 'ADMINISTRATOR':
      return 'Administrador'
    case 'OWNER':
      return 'Proprietário'
    case 'MANAGER':
      return 'Gerente'
    case 'EMPLOYEE':
      return 'Colaborador'
    default:
      return 'Cliente'
  }
}

export function translateEquipamentRole(role: EquipamentRole) {
  switch (role) {
    case 'INVERTER':
      return 'Inversor'
    default:
      return 'Módulo'
  }
}

export function translateWorkRole(role: WorkRole) {
  switch (role) {
    case 'CANCELLED':
      return 'Cancelado'
    case 'COMPLETED':
      return 'Entregue'
    default:
      return 'Em andamento'
  }
}
