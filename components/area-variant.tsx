'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from 'recharts'
import { useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { format, isValid } from 'date-fns'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

export const AreaVariant = ({ data, fields }: VariantProps) => {
  const [activeFields, setActiveFields] = useState<string[]>(
    fields.map((field) => field.key),
  )

  const customConfig = fields.reduce((acc, field) => {
    acc[field.key] = {
      label: field.label,
      color: field.color,
    }
    return acc
  }, {} as ChartConfig)

  const toggleFieldVisibility = (key: string) => {
    setActiveFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isValid(date)) {
        return format(date, 'dd MMM', { locale: ptBR })
      }
      return dateString
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ResponsiveContainer width="100%" height={350}>
        <ChartContainer config={customConfig}>
          {!!data.length ? (
            <AreaChart accessibilityLayer data={data} margin={{}}>
              <defs>
                {fields.map((field) => (
                  <linearGradient
                    key={field.key}
                    id={field.key}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={field.color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={field.color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              {fields
                .filter((field) => activeFields.includes(field.key))
                .map((field) => (
                  <Area
                    key={field.key}
                    type="monotone"
                    dataKey={field.key}
                    stackId={field.key}
                    strokeWidth={2}
                    stroke={field.color}
                    fill={`url(#${field.key})`}
                    fillOpacity={0.4}
                    className="drop-shadow-sm"
                  />
                ))}
            </AreaChart>
          ) : (
            <span className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
              Não foram encontrados dados para este período
            </span>
          )}
        </ChartContainer>
      </ResponsiveContainer>

      {!!data.length && (
        <div className="flex flex-wrap gap-2">
          {fields.map((field, index) => (
            <Badge
              key={index}
              variant={activeFields.includes(field.key) ? 'default' : 'outline'}
              onClick={() => toggleFieldVisibility(field.key)}
              className="flex items-center gap-1 cursor-pointer"
            >
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: field.color,
                }}
              />
              {field.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
