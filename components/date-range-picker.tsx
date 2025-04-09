'use client'

import * as React from 'react'
import { ptBR } from 'date-fns/locale'
import { format, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { PopoverClose } from '@radix-ui/react-popover'

type Props = {
  from?: string
  to?: string
  onChangeFilterDate: (from: string, to: string) => void
  onClearFilterDate: () => void
}

export function DateRangePicker({
  from,
  to,
  onChangeFilterDate,
  onClearFilterDate,
  className,
}: React.HTMLAttributes<HTMLDivElement> & Props) {
  const defaultTo = new Date()
  const defaultFrom = subDays(defaultTo, 7)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  })

  const onReset = () => {
    onClearFilterDate()
  }

  return (
    <div className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full lg:w-[300px] justify-start text-left font-normal bg-white',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="capitalize mr-1">
                    {format(date.from, 'LLL dd, y', {
                      locale: ptBR,
                    })}
                  </span>
                  -
                  <span className="capitalize ml-1">
                    {format(date.to, 'LLL dd, y', { locale: ptBR })}
                  </span>
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Selecionar data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div className="p-4 w-full grid sm:grid-cols-2 items-center gap-2">
            <PopoverClose asChild>
              <Button
                onClick={onReset}
                disabled={!date?.from || !date.to}
                className="w-full"
                variant="outline"
              >
                Limpar
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button
                onClick={() =>
                  onChangeFilterDate(
                    format(date?.from || defaultFrom, 'yyyy-MM-dd'),
                    format(date?.to || defaultTo, 'yyyy-MM-dd'),
                  )
                }
                disabled={!date?.from || !date.to}
                className="w-full"
              >
                Filtrar
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
