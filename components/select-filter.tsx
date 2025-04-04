import { cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  placeholder: string
  defaultValue: any
  data: FilterOptionsProps
  value: any
  isDisabled?: boolean
  className?: string
  onChange: (value: any) => void
}

export const SelectFilter = ({
  placeholder,
  defaultValue,
  data,
  value,
  isDisabled,
  className,
  onChange,
}: Props) => {
  const selectValue = value === undefined ? 'undefined' : String(value)
  const selectDefaultValue =
    defaultValue === undefined ? 'undefined' : String(defaultValue)

  return (
    <Select
      value={selectValue}
      defaultValue={selectDefaultValue}
      disabled={isDisabled}
      onValueChange={(val) => {
        onChange(val === 'undefined' ? undefined : val)
      }}
    >
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((item, i) => (
            <SelectItem
              key={i}
              value={
                item.value === undefined ? 'undefined' : String(item.value)
              }
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
