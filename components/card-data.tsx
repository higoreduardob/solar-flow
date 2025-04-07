import { CircleX, LucideProps } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Props = {
  title: string
  description: string
  values: string[]
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  disabled?: boolean
  options: FilterOptionsProps
  onChange: (values: string[]) => void
}

export const CardData = ({
  title,
  description,
  values,
  icon: Icon,
  disabled,
  options,
  onChange,
}: Props) => {
  const handleRemove = (index: number) =>
    onChange(values.filter((_, i) => i !== index))

  return (
    <Card className="flex flex-col gap-2 p-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-[0.8rem] text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {values && !!values.length ? (
          <div className="flex items-center flex-wrap gap-2">
            {values.map((value, index) => (
              <div
                key={index}
                className="group flex items-center gap-1 relative rounded-md text-sm font-medium transition-colors focus-visible:outline-none border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                <div className="group-hover:flex hidden transition-all duration-500 items-center gap-1 absolute top-0 right-0 bg-white/50 p-1 rounded-md">
                  <span
                    title="Remover"
                    className={cn(
                      'cursor-pointer text-black',
                      disabled && 'cursor-not-allowed',
                    )}
                    onClick={() => !disabled && handleRemove(index)}
                  >
                    <CircleX size={16} />
                  </span>
                </div>
                <Icon size={16} />
                <span className="text-xs text-muted-foreground">
                  {options.find((option) => option.value === value)?.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            Nenhum registro cadastro
          </span>
        )}
      </CardContent>
    </Card>
  )
}
