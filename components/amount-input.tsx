import { useEffect } from 'react'
import CurrencyInput from 'react-currency-input-field'
import { Info, MinusCircle, PlusCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Props = {
  value: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  isPending?: boolean
  isExpenses?: boolean
  isTooltip?: boolean
  disabled?: boolean
}

export const AmountInput = ({
  value,
  onChange,
  placeholder,
  isPending,
  isExpenses,
  isTooltip = true,
  disabled,
}: Props) => {
  const parsedValue = parseFloat(value)
  const isIncome = parsedValue > 0
  const isExpense = parsedValue < 0

  const onReverseValue = () => {
    if (!value) return
    const newValue = parseFloat(value) * -1
    onChange(newValue.toString())
  }

  useEffect(() => {
    if (disabled && isExpenses) {
      const newValue = parseFloat(value)
      if (newValue > 0) onChange((newValue * -1).toString())
    }
  }, [value, disabled, isExpense, onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      {isTooltip && (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onReverseValue}
                disabled={disabled}
                className={cn(
                  'bg-slate-400 hover:bg-slate-500 absolute top-1.5 left-1.5 rounded-md p-2 flex items-center justify-center transition',
                  isIncome && 'bg-emerald-500 hover:bg-emerald-600',
                  isExpense && 'bg-rose-500 hover:bg-rose-600',
                )}
              >
                {!parsedValue && <Info className="size-3 text-white" />}
                {isIncome && <PlusCircle className="size-3 text-white" />}
                {isExpense && <MinusCircle className="size-3 text-white" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Use [+] para receita e [-] para despesa
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <CurrencyInput
        prefix="R$"
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          isTooltip && 'pl-10',
        )}
        placeholder={placeholder}
        value={value}
        decimalScale={2}
        decimalsLimit={2}
        onValueChange={onChange}
        disabled={isPending}
      />
      {isTooltip && (
        <p className="text-xs text-muted-foreground mt-2">
          {isIncome && 'Esta transação é uma receita'}
          {isExpense && 'Esta transação é uma despesa'}
        </p>
      )}
    </div>
  )
}
