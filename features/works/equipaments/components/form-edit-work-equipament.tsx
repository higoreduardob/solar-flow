import { InsertEquipamentInWorkFormValues } from '@/features/works/equipaments/schema'

import { useGetWorkEquipaments } from '@/features/works/equipaments/api/use-get-work-equipaments'
import { useEditWorkEquipaments } from '@/features/works/equipaments/api/use-edit-work-equipaments'

import { Loader } from '@/components/loader'
import { FormWorkEquipament } from '@/features/works/equipaments/components/form-work-equipament'

type Props = {
  id: string
}

export const FormEditWorkEquipament = ({ id }: Props) => {
  const equipamentQuery = useGetWorkEquipaments(id)
  const editMutation = useEditWorkEquipaments(id)

  const isLoading = equipamentQuery.isLoading

  if (isLoading) {
    return <Loader />
  }

  const isPending = editMutation.isPending

  const { data } = equipamentQuery

  if (!data) return null

  const isNonInProgress = data.role !== 'INPROGRESS'

  const defaultValues: InsertEquipamentInWorkFormValues = {
    equipaments: data.equipaments,
  }

  const onSubmit = async (values: InsertEquipamentInWorkFormValues) => {
    editMutation.mutate(values)
  }

  return (
    <FormWorkEquipament
      isPending={isPending || isNonInProgress}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />
  )
}
