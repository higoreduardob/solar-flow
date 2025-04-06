import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertMaterialDefaultValues,
  type InsertMaterialFormValues,
  type InsertMaterialSchema,
} from '@/features/materials/schema'

import { useUploadFile } from '@/features/common/api/use-upload-file'
import { useNewMaterial } from '@/features/materials/hooks/use-new-material'
import { useCreateMaterial } from '@/features/materials/api/use-create-material'

import { FormMaterial } from '@/features/materials/components/form-material'

export const FormNewMaterial = () => {
  const { isOpen, onClose } = useNewMaterial()

  const mutation = useCreateMaterial()
  const mutationUploadFile = useUploadFile('materials')
  const isPending = mutation.isPending || mutationUploadFile.isPending

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
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormMaterial
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertMaterialDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
