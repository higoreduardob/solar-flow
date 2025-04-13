import { InsertEnterpriseFormValues } from '@/features/enterprise/schema'

import { useGetEnterprise } from '@/features/manager/api/use-get-enterprise'
import { useEditEnterprise } from '@/features/manager/api/use-edit-enterprise'
import { useOpenEnterprise } from '@/features/manager/hooks/use-open-enterprise'

import { FormEnterprise } from '@/features/enterprise/components/form-enterprise'

export const FormEditEnterprise = () => {
  const { id, isOpen, onClose } = useOpenEnterprise()

  const enterpriseQuery = useGetEnterprise(id)
  const editMutation = useEditEnterprise(id)

  const isPending = editMutation.isPending

  const { data } = enterpriseQuery

  if (!data) return null

  const defaultValues: InsertEnterpriseFormValues = {
    name: data.name,
    email: data.email,
    whatsApp: data.whatsApp,
    cpfCnpj: data.cpfCnpj,
    address: data.address,
  }

  const onSubmit = async (values: InsertEnterpriseFormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormEnterprise
      id={id}
      isOpen={isOpen}
      isPending={isPending}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      handleClose={onClose}
    />
  )
}
