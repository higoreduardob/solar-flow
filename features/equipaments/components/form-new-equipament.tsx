import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertEquipamentDefaultValues,
  InsertEquipamentFormValues,
  InsertEquipamentSchema,
} from '@/features/equipaments/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import { useUploadFile } from '@/features/common/api/use-upload-file'
import { useNewEquipament } from '@/features/equipaments/hooks/use-new-equipament'
import { useCreateEquipament } from '@/features/equipaments/api/use-create-equipament'

import { FormEquipament } from '@/features/equipaments/components/form-equipament'

export const FormNewEquipament = () => {
  const { isOpen, onClose } = useNewEquipament()

  const mutation = useCreateEquipament()
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('equipaments')
  const isPending = mutation.isPending || uploadPending

  const onSubmit = async (values: InsertEquipamentFormValues) => {
    const { inmetro, datasheet, ...restValues } = values

    if (inmetro instanceof File || datasheet instanceof File) {
      let uploadedInmetro: InsertDocumentFormValues | null = null
      let uploadedDatasheet: InsertDocumentFormValues | null = null

      if (inmetro instanceof File) {
        uploadedInmetro = await uploadFile({
          file: inmetro,
        })
      }
      if (datasheet instanceof File) {
        uploadedDatasheet = await uploadFile({
          file: datasheet,
        })
      }

      handleSubmit({
        ...restValues,
        inmetro: uploadedInmetro,
        datasheet: uploadedDatasheet,
      })
    } else {
      handleSubmit({
        ...restValues,
        inmetro,
        datasheet,
      })
    }
  }

  const handleSubmit = (values: InsertEquipamentSchema) => {
    const power = convertAmountToMiliunits(values.power)
    const voc = convertAmountToMiliunits(values.voc)
    const isc = convertAmountToMiliunits(values.isc)
    const vmp = convertAmountToMiliunits(values.vmp)
    const imp = convertAmountToMiliunits(values.imp)

    mutation.mutate(
      {
        ...values,
        power,
        voc,
        isc,
        vmp,
        imp,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

  return (
    <FormEquipament
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertEquipamentDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
