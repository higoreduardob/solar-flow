import { useState } from 'react'
import { AreaChart, BarChart3 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { BarVariant } from '@/components/bar-variant'
import { AreaVariant } from '@/components/area-variant'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { WrapperVariant } from '@/app/plataforma//_components/wrapper-variant'

type Props = {
  title: string
} & VariantProps

export const ChartVariant = ({ data, fields, title }: Props) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const onTypeChange = (type: 'area' | 'bar') => {
    setChartType(type)
  }

  return (
    <WrapperVariant
      title={title}
      options={
        <Select defaultValue={chartType} onValueChange={onTypeChange}>
          <SelectTrigger className="lg:w-auto h-9 rounded-md px-2">
            <SelectValue placeholder="Tipo do gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area">
              <div className="flex items-center">
                <AreaChart className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">Área</p>
              </div>
            </SelectItem>
            <SelectItem value="bar">
              <div className="flex items-center">
                <BarChart3 className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">Barras</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <>
        {chartType === 'area' && <AreaVariant data={data} fields={fields} />}
        {chartType === 'bar' && <BarVariant data={data} fields={fields} />}
      </>
    </WrapperVariant>
  )
}

export const CharVariantLoading = () => {
  return (
    <Card className="space-y-2 border-none">
      <CardHeader className="flex items-center justify-between gap-2">
        <Skeleton className="h-[36px] w-[100px]" />
        <Skeleton className="h-[36px] w-[100px]" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-[350px] w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[80px]" />
        </div>
      </CardContent>
    </Card>
  )
}
