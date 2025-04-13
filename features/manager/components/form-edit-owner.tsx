import { InsertOwnerFormValues } from '@/features/manager/schema'

import { useOpenOwner } from '@/features/manager/hooks/use-open-owner'
import { useGetEnterpriseOwners } from '@/features/manager/api/use-get-enterprise-owners'
import { useEditEnterpriseOwners } from '@/features/manager/api/use-edit-enterprise-owners'

import { FormOwner } from '@/features/manager/components/form-owner'

export const FormEditOwner = () => {
  const { id, isOpen, onClose } = useOpenOwner()

  const ownerQuery = useGetEnterpriseOwners(id)
  const editMutation = useEditEnterpriseOwners(id)

  const isPending = editMutation.isPending

  const { data } = ownerQuery

  if (!data) return null

  const defaultValues: InsertOwnerFormValues = {
    owners: data.owners.map((user) => user.user.id),
  }

  const onSubmit = async (values: InsertOwnerFormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormOwner
      id={id}
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      handleClose={onClose}
    />
  )
}
