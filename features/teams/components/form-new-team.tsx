import {
  insertTeamDefaultValues,
  InsertTeamFormValues,
} from '@/features/teams/schema'

import { useNewTeam } from '@/features/teams/hooks/use-new-team'
import { useCreateTeam } from '@/features/teams/api/use-create-team'

import { FormTeam } from '@/features/teams/components/form-team'

export const FormNewTeam = () => {
  const { isOpen, onClose } = useNewTeam()

  const mutation = useCreateTeam()
  const isPending = mutation.isPending

  const onSubmit = async (values: InsertTeamFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormTeam
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertTeamDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
