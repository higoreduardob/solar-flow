import { FilePlus2, Ban } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ButtonLoading } from '@/components/button-custom'

type Props = {
  id?: string
  formId: string
  title: string
  description: string
  isOpen: boolean
  isPending?: boolean
  status?: boolean
  onDelete?: () => void
  handleClose: () => void
  className?: string
  children: React.ReactNode
}

export const FormDialog = ({
  id,
  formId,
  title,
  description,
  isOpen,
  isPending,
  status,
  onDelete,
  handleClose,
  className,
  children,
}: Props) => {
  const handleSubmit = () => {
    document
      .getElementById(formId)
      ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }

  const handleDelete = () => {
    onDelete?.()
  }

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
        <DialogFooter className="flex items-center sm:flex-row flex-col gap-2">
          {!!id && (
            <ButtonLoading
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleDelete}
              className="sm:w-fit w-full"
            >
              <Ban className="size-4 mr-2" />
              {status ? 'Bloquear' : 'Desbloquear'}
            </ButtonLoading>
          )}
          <DialogClose asChild>
            <ButtonLoading
              variant="outline"
              disabled={isPending}
              className="sm:w-fit w-full"
            >
              Cancelar
            </ButtonLoading>
          </DialogClose>
          <ButtonLoading
            type="submit"
            onClick={handleSubmit}
            disabled={isPending}
            className="sm:w-fit w-full"
          >
            <FilePlus2 size={16} className="mr-2" />
            Salvar
          </ButtonLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
