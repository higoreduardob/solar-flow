import { LucideProps } from 'lucide-react'
import { cva, VariantProps } from 'class-variance-authority'

import { cn, formatValue, formatPercentage } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CountUp } from '@/components/count-up'
import { Skeleton } from '@/components/ui/skeleton'

const boxVariant = cva('rounded-sm p-2', {
  variants: {
    variant: {
      default: 'bg-blue-500/20',
      success: 'bg-emerald-500/20',
      danger: 'bg-rose-500/20',
      warning: 'bg-yellow-500/20',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const iconVariant = cva('size-5', {
  variants: {
    variant: {
      default: 'text-blue-500',
      success: 'text-emerald-500',
      danger: 'text-rose-500',
      warning: 'text-yellow-500',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type BoxVariants = VariantProps<typeof boxVariant>
type IconVariants = VariantProps<typeof iconVariant>

interface CardAnalyticProps extends BoxVariants, IconVariants {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  title: string
  value?: number
  dateRange: string
  percentageChange?: number
  isCurrency?: boolean
  unit?: UnitIdentifier
}

export const CardAnalytic = ({
  icon: Icon,
  title,
  value = 0,
  variant,
  dateRange,
  percentageChange = 0,
  isCurrency = true,
  unit,
}: CardAnalyticProps) => {
  return (
    <Card className="border-none p-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <CardTitle className="font-normal text-base line-clamp-1">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-1">
            {dateRange}
          </CardDescription>
        </div>
        <div className={cn('shrink-0', boxVariant({ variant }))}>
          <Icon className={cn(iconVariant({ variant }))} />
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <h1 className="font-medium text-xlline-clamp-1 break-all ">
          <CountUp
            preserveValue
            start={0}
            end={value}
            decimals={2}
            decimalPlaces={2}
            formattingFn={() => formatValue(value, { isCurrency, unit })}
          />
        </h1>
        <p
          className={cn(
            'text-muted-foreground text-xs line-clamp-1',
            percentageChange > 0 && 'text-emerald-500',
            percentageChange < 0 && 'text-rose-500',
          )}
        >
          {formatPercentage(percentageChange, { addPrefix: true })} no período
        </p>
      </CardContent>
    </Card>
  )
}

export const CardAnalyticLoading = () => {
  return (
    <Card className="border-none p-4 h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="size-12" />
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <Skeleton className="shrink-0 h-5 w-24" />
        <Skeleton className="shrink-0 h-5 w-20" />
      </CardContent>
    </Card>
  )
}
