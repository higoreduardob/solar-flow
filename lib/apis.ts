export async function searchZipCode(zipCode: string) {
  const regex = /^[0-9]{8}$/
  const currZipCode = zipCode.replace(/\D/g, '')

  if (!regex.test(currZipCode)) return null

  const url = `https://viacep.com.br/ws/${currZipCode}/json/`
  return await fetch(url)
    .then((res) => res.json())
    .then((data) => ({
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    }))
    .catch((err) => console.log(err))
}
