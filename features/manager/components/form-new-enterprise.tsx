import {
  insertEnterpriseDefaultValues,
  InsertEnterpriseFormValues,
} from '@/features/enterprise/schema'

import { useNewEnterprise } from '@/features/manager/hooks/use-new-enterprise'
import { useCreateEnterprise } from '@/features/manager/api/use-create-enterprise'

import { FormEnterprise } from '@/features/enterprise/components/form-enterprise'

export const FormNewEnterprise = () => {
  const { isOpen, onClose, token, password } = useNewEnterprise()

  const mutation = useCreateEnterprise(token, password)
  const isPending = mutation.isPending

  const onSubmit = (values: InsertEnterpriseFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormEnterprise
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={insertEnterpriseDefaultValues}
      onSubmit={onSubmit}
      handleClose={onClose}
    />
  )
}
