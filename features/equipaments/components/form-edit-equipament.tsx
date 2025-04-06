import { convertAmountToMiliunits } from '@/lib/utils'

import {
  InsertEquipamentFormValues,
  InsertEquipamentSchema,
} from '@/features/equipaments/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useUploadFile } from '@/features/common/api/use-upload-file'
import { useGetEquipament } from '@/features/equipaments/api/use-get-equipament'
import { useEditEquipament } from '@/features/equipaments/api/use-edit-equipament'
import { useOpenEquipament } from '@/features/equipaments/hooks/use-open-equipament'
import { useDeleteEquipament } from '@/features/equipaments/api/use-delete-equipament'
import { useUndeleteEquipament } from '@/features/equipaments/api/use-undelete-equipament'

import { FormEquipament } from '@/features/equipaments/components/form-equipament'

export const FormEditEquipament = () => {
  const { id, isOpen, onClose } = useOpenEquipament()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const equipamentQuery = useGetEquipament(id)
  const editMutation = useEditEquipament(id)
  const deleteMutation = useDeleteEquipament(id)
  const undeleteMutation = useUndeleteEquipament(id)
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('equipaments')

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending ||
    uploadPending

  const { data } = equipamentQuery

  if (!data) return null

  const defaultValues: InsertEquipamentFormValues = {
    name: data.name,
    supplier: data.supplier,
    power: data.power,
    role: data.role,
    obs: data.obs,

    voc: data.voc,
    isc: data.isc,
    vmp: data.vmp,
    imp: data.imp,

    circuitBreaker: data.circuitBreaker,
    mppt: data.mppt,
    quantityString: data.quantityString,

    inmetro: data.inmetro,
    datasheet: data.datasheet,
  }

  const onSubmit = async (values: InsertEquipamentFormValues) => {
    const { inmetro, datasheet, ...restValues } = values

    if (inmetro instanceof File || datasheet instanceof File) {
      let uploadedInmetro: InsertDocumentFormValues | null | undefined = null
      let uploadedDatasheet: InsertDocumentFormValues | null | undefined = null

      if (inmetro instanceof File) {
        uploadedInmetro = await uploadFile({
          file: inmetro,
        })
      } else {
        uploadedInmetro = inmetro
      }
      if (datasheet instanceof File) {
        uploadedDatasheet = await uploadFile({
          file: datasheet,
        })
      } else {
        uploadedDatasheet = datasheet
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
    const circuitBreaker = convertAmountToMiliunits(values.circuitBreaker)
    const mppt = convertAmountToMiliunits(values.mppt)
    const quantityString = convertAmountToMiliunits(values.vmp)

    editMutation.mutate(
      {
        ...values,
        power,
        voc,
        isc,
        vmp,
        imp,
        circuitBreaker,
        mppt,
        quantityString,
      },
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
      <FormEquipament
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
