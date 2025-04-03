export function removeMask(value: string | undefined | null) {
  return value ? value.replace(/[^0-9]+/g, '') : ''
}

export function phoneMask(value: string | undefined | null) {
  const str = value ? value.replace(/\D/g, '') : ''

  // PHONE | MOBILE
  return str.length < 11
    ? str
        .replace(/(\d{0})(\d)/, '$1($2')
        .replace(/(\d{2})(\d)/, '$1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})(\d+?$)/, '$1')
    : str
        .replace(/(\d{0})(\d)/, '$1($2')
        .replace(/(\d{2})(\d)/, '$1) $2')
        .replace(/(\d)(\d{1})(\d)/, '$1 $2$3')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})(\d+?$)/, '$1')
}

export function cpfCnpjMask(value: string | undefined | null) {
  const str = value ? value.replace(/\D/g, '') : ''

  // CNPJ | CPF
  return str.length > 11
    ? str
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    : str
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
}

export function zipCodeMask(value: string | undefined | null) {
  return value
    ? value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1-$2')
        .replace(/(\d{3})(\d+?$)/, '$1')
    : ''
}
