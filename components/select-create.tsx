import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { SingleValue, components } from 'react-select'
import CreateableSelect from 'react-select/creatable'

type Props = {
  id?: string
  onChange: (vale?: string) => void
  onCreate?: (value: string) => void
  options?: FilterOptionsProps
  value?: string | null | undefined
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
}

const NoOptionsMessage = (props: any) => {
  return (
    <components.NoOptionsMessage {...props}>
      <span>Nenhuma opção disponível</span>
    </components.NoOptionsMessage>
  )
}

export const SelectCreate = ({
  id,
  onChange,
  onCreate,
  options = [],
  value,
  disabled,
  isLoading,
  placeholder,
}: Props) => {
  const { theme } = useTheme()

  const isLight = theme === 'light'
  const borderColor = isLight ? '#E4E4E7' : '#222222' // '#1E293B'
  const textColor = isLight ? '#09090B' : '#fff'
  const placeholderColor = isLight ? '#64748B' : '#9EA3A3' // '#8998AC'
  const optionBgActive = isLight ? '#F4F4F5' : '#27272A'
  const optionText = isLight ? '#09090B' : '#FAFAFA'
  const menuBg = isLight ? '#fff' : '#09090B'
  const menuBorderColor = isLight ? '#fff' : '#27272A'

  const formatedValue = useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  const onSelect = (option: SingleValue<{ label: string; value: string }>) => {
    onChange(option?.value)
  }

  return (
    <CreateableSelect
      key={value}
      inputId={id}
      placeholder={placeholder}
      className="text-sm h-10 border-input"
      components={{ NoOptionsMessage }}
      styles={{
        control: (base) => ({
          ...base,
          background: 'transparent',
          borderColor,
          cursor: 'pointer',
          boxShadow: 'none',
          ':hover': {
            borderColor,
          },
          borderRadius: '6px',
          height: '40px',
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor:
            isSelected || isFocused ? optionBgActive : 'transparent',
          color: optionText,
          paddingLeft: '8px',
          marginLeft: '4px',
          marginRight: '4px',
          width: 'calc(100% - 8px)',
          borderRadius: '4px',
          ':active': {
            ...base[':active'],
            backgroundColor: optionBgActive,
          },
        }),
        placeholder: (base) => ({ ...base, color: placeholderColor }),
        input: (base) => ({ ...base, color: textColor }),
        menu: (base) => ({
          ...base,
          background: menuBg,
          border: '1px solid',
          borderColor: menuBorderColor,
        }),
        singleValue: (base) => ({ ...base, color: textColor }),
      }}
      value={formatedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
      isLoading={isLoading}
      formatCreateLabel={(inputValue) => `Adicionar "${inputValue}"`}
    />
  )
}
