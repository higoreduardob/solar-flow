import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { SelectSingleEventHandler } from 'react-day-picker'

import { cn } from '@/lib/utils'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

type Props = {
  id?: string
  value?: Date
  label: string
  onChange?: SelectSingleEventHandler
  disabled?: boolean
}

export const DatePicker = ({ id, value, label, onChange, disabled }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild id={id}>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal bg-transparent',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4 mr-2" />
          {value ? (
            format(value, 'PPP', { locale: ptBR })
          ) : (
            <span>{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
