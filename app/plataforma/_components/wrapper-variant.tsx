import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  title: string
  options?: React.JSX.Element
  children: React.ReactNode
}

export const WrapperVariant = ({ title, options, children }: Props) => {
  return (
    <Card className="space-y-2 border-none">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle className="font-normal text-base line-clamp-1">
          {title}
        </CardTitle>
        {options && options}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
