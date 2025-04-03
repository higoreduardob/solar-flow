import { UpdateFormValues } from '@/features/auth/schema'

import { ButtonLoading } from '@/components/button-custom'
import { FormUser } from '@/features/users/components/form-user'

type FormUpdateProps = {
  isPending: boolean
  defaultValues: UpdateFormValues
  onSubmit: (values: UpdateFormValues) => void
}

export const FormUpdate = ({
  isPending,
  defaultValues,
  onSubmit,
}: FormUpdateProps) => {
  const handleSubmit = () => {
    document
      .getElementById('form-user')
      ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }

  return (
    <>
      <FormUser
        formId="form-user"
        defaultValues={defaultValues}
        isPending={isPending}
        onSubmit={onSubmit}
      />
      <ButtonLoading
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-fit"
      >
        Salvar
      </ButtonLoading>
    </>
  )
}
