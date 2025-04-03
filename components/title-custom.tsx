import { cn } from '@/lib/utils'

export const TitleProtected = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <h1 className={cn('text-xl font-bold', className)}>{children}</h1>
}
