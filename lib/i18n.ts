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
