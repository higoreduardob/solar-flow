import { InsertCategoryFormValues } from '@/features/materials/categories/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useGetCategory } from '@/features/materials/categories/api/use-get-category'
import { useEditCategory } from '@/features/materials/categories/api/use-edit-category'
import { useOpenCategory } from '@/features/materials/categories/hooks/use-open-category'
import { useDeleteCategory } from '@/features/materials/categories/api/use-delete-category'
import { useUndeleteCategory } from '@/features/materials/categories/api/use-undelete-category'

import { FormCategory } from '@/features/materials/categories/components/form-category'

export const FormEditCategory = () => {
  const { id, isOpen, onClose } = useOpenCategory()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const categoryQuery = useGetCategory(id)
  const editMutation = useEditCategory(id)
  const deleteMutation = useDeleteCategory(id)
  const undeleteMutation = useUndeleteCategory(id)

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending

  const { data } = categoryQuery

  if (!data) return null

  const defaultValues: InsertCategoryFormValues = {
    name: data.name,
  }

  const onSubmit = async (values: InsertCategoryFormValues) => {
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
      <FormCategory
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
