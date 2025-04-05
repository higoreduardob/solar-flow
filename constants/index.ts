export const FilterStatus: FilterOptionsProps = [
  { label: 'Todos', value: undefined },
  { label: 'Ativos', value: 'true' },
  { label: 'Bloqueados', value: 'false' },
]

export const FilterOptionsPageSize: number[] = [10, 20, 30, 40]

export const MaxFileSize = 512 * 1024 // 512KB

export const AllowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.dwg',
]
