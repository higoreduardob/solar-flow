export function validateCPF(
  cpf: string | null | undefined
): boolean | undefined {
  if (!cpf) return

  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf[10])
}

export function validateCNPJ(
  cnpj: string | null | undefined
): boolean | undefined {
  if (!cnpj) return

  cnpj = cnpj.replace(/\D/g, '')
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj[i]) * pesos1[i]
  }
  const resto1 = soma % 11
  const primeiroDV = resto1 < 2 ? 0 : 11 - resto1

  if (primeiroDV !== parseInt(cnpj[12])) return false

  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj[i]) * pesos2[i]
  }
  const resto2 = soma % 11
  const segundoDV = resto2 < 2 ? 0 : 11 - resto2

  return segundoDV === parseInt(cnpj[13])
}
