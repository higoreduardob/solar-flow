import { convertAmountToMiliunits } from '@/lib/utils'

import {
  InsertMaterialFormValues,
  InsertMaterialSchema,
} from '@/features/materials/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useUploadFile } from '@/features/common/api/use-upload-file'
import { useGetMaterial } from '@/features/materials/api/use-get-material'
import { useEditMaterial } from '@/features/materials/api/use-edit-material'
import { useOpenMaterial } from '@/features/materials/hooks/use-open-material'
import { useDeleteMaterial } from '@/features/materials/api/use-delete-material'
import { useUndeleteMaterial } from '@/features/materials/api/use-undelete-material'

import { FormMaterial } from '@/features/materials/components/form-material'

export const FormEditMaterial = () => {
  const { id, isOpen, onClose } = useOpenMaterial()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const materialQuery = useGetMaterial(id)
  const editMutation = useEditMaterial(id)
  const deleteMutation = useDeleteMaterial(id)
  const undeleteMutation = useUndeleteMaterial(id)
  const mutationUploadFile = useUploadFile('materials')

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending ||
    mutationUploadFile.isPending

  const { data } = materialQuery

  if (!data) return null

  const defaultValues: InsertMaterialFormValues = {
    name: data.name,
    amount: String(data.amount),
    supplier: data.supplier,
    stock: data.stock,
    obs: data.obs,
    categoryId: data.categoryId || '',
    measureId: data.measureId || '',
    document: data.document,
  }

  const onSubmit = async (values: InsertMaterialFormValues) => {
    const amount = convertAmountToMiliunits(values.amount)
    const { document, ...restValues } = values

    if (document instanceof File) {
      mutationUploadFile.mutate(
        { file: document },
        {
          onSuccess: (uploadedDocument) => {
            handleSubmit({
              ...restValues,
              amount,
              document: uploadedDocument,
            })
          },
        },
      )
    } else {
      handleSubmit({
        ...restValues,
        amount,
        document,
      })
    }
  }

  const handleSubmit = (values: InsertMaterialSchema) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
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
      <FormMaterial
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
