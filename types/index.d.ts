declare type PasswordOptionsProps = 'STRONG' | 'GOOD' | 'WEAK'

declare type FilterOptionsProps = {
  label: string | any
  value: string | any
}[]

declare type DataField = {
  key: string
  color: string
  label: string
}

declare type VariantProps = {
  data: {
    date?: string
    [key: string]: number | string
  }[]
  fields: DataField[]
}

declare type UnitIdentifier =
  | 'degree'
  | 'celsius'
  | 'fahrenheit'
  | 'fluid-ounce'
  | 'gallon'
  | 'inch'
  | 'kilobyte'
  | 'kilogram'
  | 'liter'
  | 'megabyte'
  | 'meter'
  | 'mile'
  | 'milliliter'
  | 'millimeter'
  | 'second'
  | 'terabyte'
  | 'yard'
  | 'gram'
  | 'hour'
  | 'minute'
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'percent' // não funciona como unit, mas está aqui por segurança

declare type Period = {
  from: string | Date | undefined
  to: string | Date | undefined
}
