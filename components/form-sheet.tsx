import { Delete, FilePlus2 } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { ButtonLoading } from './button-custom'

type Props = {
  id?: string
  formId: string
  title: string
  description: string
  isOpen: boolean
  isPending?: boolean
  onDelete?: () => void
  handleClose: () => void
  children: React.ReactNode
}

export const FormSheet = ({
  id,
  formId,
  title,
  description,
  isOpen,
  isPending,
  onDelete,
  handleClose,
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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="space-y-4 w-full">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
          <div className="flex items-center sm:flex-row flex-col gap-2">
            {!!id && (
              <ButtonLoading
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleDelete}
                className="sm:w-fit w-full"
              >
                <Delete className="size-4 mr-2" />
                Excluir
              </ButtonLoading>
            )}
            <SheetClose asChild>
              <ButtonLoading
                variant="outline"
                disabled={isPending}
                className="sm:w-fit w-full"
              >
                Cancelar
              </ButtonLoading>
            </SheetClose>
            <ButtonLoading
              type="submit"
              onClick={handleSubmit}
              disabled={isPending}
              className="sm:w-fit w-full"
            >
              <FilePlus2 size={16} className="mr-2" />
              Salvar
            </ButtonLoading>
          </div>
        </SheetHeader>
        <div className="px-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
