import { InsertTeamFormValues } from '@/features/teams/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { useGetTeam } from '@/features/teams/api/use-get-team'
import { useEditTeam } from '@/features/teams/api/use-edit-team'
import { useOpenTeam } from '@/features/teams/hooks/use-open-team'
import { useDeleteTeam } from '@/features/teams/api/use-delete-team'
import { useUndeleteTeam } from '@/features/teams/api/use-undelete-team'

import { FormTeam } from '@/features/teams/components/form-team'

export const FormEditTeam = () => {
  const { id, isOpen, onClose } = useOpenTeam()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, você poderá reverter filtrando suas condições.',
  )

  const teamQuery = useGetTeam(id)
  const editMutation = useEditTeam(id)
  const deleteMutation = useDeleteTeam(id)
  const undeleteMutation = useUndeleteTeam(id)

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    undeleteMutation.isPending

  const { data } = teamQuery

  if (!data) return null

  const defaultValues: InsertTeamFormValues = {
    name: data.name,
    employees: data.users?.map((user) => user.user.id),
    obs: data.obs,
  }

  const onSubmit = async (values: InsertTeamFormValues) => {
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
      <FormTeam
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
