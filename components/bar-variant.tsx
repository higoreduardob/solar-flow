'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from 'recharts'
import { useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { format, isValid } from 'date-fns'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

export const BarVariant = ({ data, fields }: VariantProps) => {
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
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
                tickLine={false}
                tickMargin={8}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {fields
                .filter((field) => activeFields.includes(field.key))
                .map((field) => (
                  <Bar
                    key={field.key}
                    dataKey={field.key}
                    stackId="a"
                    fill={`var(--color-${field.key})`}
                    radius={[0, 0, 4, 4]}
                  />
                ))}
            </BarChart>
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
