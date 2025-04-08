import { convertAmountToMiliunits } from '@/lib/utils'

import { InsertMaterialInWorkFormValues } from '@/features/works/materials/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useGetWorkMaterial } from '@/features/works/materials/api/use-get-work-material'
import { useEditWorkMaterial } from '@/features/works/materials/api/use-edit-work-material'
import { useOpenWorkMaterial } from '@/features/works/materials/hooks/use-open-work-material'
import { useDeleteWorkMaterial } from '@/features/works/materials/api/use-delete-work-material'

import { FormWorkMaterial } from '@/features/works/materials/components/form-work-material'

export const FormEditWorkMaterial = () => {
  const { isOpen, onClose, id, workId } = useOpenWorkMaterial()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const workMaterialQuery = useGetWorkMaterial(id, workId)
  const editMutation = useEditWorkMaterial(id, workId)
  const deleteMutation = useDeleteWorkMaterial(id, workId)

  const isPending = editMutation.isPending || deleteMutation.isPending

  const { data } = workMaterialQuery

  if (!data) return null

  const defaultValues: InsertMaterialInWorkFormValues = {
    amount: String(data.amount),
    materialId: data.materialId,
    quantity: data.quantity,
  }

  const isNonInProgress = data.work.role !== 'INPROGRESS'

  const onSubmit = async (values: InsertMaterialInWorkFormValues) => {
    if (isNonInProgress) return

    const amount = convertAmountToMiliunits(values.amount)
    editMutation.mutate(
      { ...values, amount },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  const handleDelete = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        },
      })
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <FormWorkMaterial
        id={id}
        isOpen={isOpen}
        isPending={isPending || isNonInProgress}
        defaultValues={defaultValues}
        handleClose={onClose}
        onSubmit={onSubmit}
        onDelete={handleDelete}
      />
    </>
  )
}
