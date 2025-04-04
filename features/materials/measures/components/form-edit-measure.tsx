'use client'

import { InsertMeasureFormValues } from '@/features/materials/measures/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useGetMeasure } from '@/features/materials/measures/api/use-get-measure'
import { useEditMeasure } from '@/features/materials/measures/api/use-edit-measure'
import { useOpenMeasure } from '@/features/materials/measures/hooks/use-open-measure'
import { useDeleteMeasure } from '@/features/materials/measures/api/use-delete-measure'
import { useUndeleteMeasure } from '@/features/materials/measures/api/use-undelete-measure'

import { FormMeasure } from '@/features/materials/measures/components/form-measure'

export const FormEditMeasure = () => {
  const { id, isOpen, onClose } = useOpenMeasure()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const measureQuery = useGetMeasure(id)
  const editMutation = useEditMeasure(id)
  const deleteMutation = useDeleteMeasure(id)
  const undeleteMutation = useUndeleteMeasure(id)

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending

  const { data } = measureQuery

  if (!data) return null

  const defaultValues: InsertMeasureFormValues = {
    name: data.name,
  }

  const onSubmit = async (values: InsertMeasureFormValues) => {
    editMutation.mutate(
      { ...values },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  const handleDelete = async () => {
    const ok = await confirm()

    if (ok) {
      if (data.status)
        deleteMutation.mutate(undefined, {
          onSuccess: () => {
            onClose()
          },
        })
      else
        undeleteMutation.mutate(undefined, {
          onSuccess: () => {
            onClose()
          },
        })
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <FormMeasure
        id={id}
        isOpen={isOpen}
        isPending={isPending}
        status={data.status}
        defaultValues={defaultValues}
        onDelete={handleDelete}
        handleClose={onClose}
        onSubmit={onSubmit}
      />
    </>
  )
}
