import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  title: string
  description: string
  isOpen: boolean
  handleClose: () => void
  className?: string
  children: React.ReactNode
}

export const ContentDialog = ({
  title,
  description,
  isOpen,
  handleClose,
  className,
  children,
}: Props) => {
  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent
        className={cn(
          'border-none w-full max-w-screen-lg max-h-[90%] overflow-y-auto',
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
