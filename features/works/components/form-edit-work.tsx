import { InsertWorkFormValues } from '@/features/works/schema'

import { useConfirm } from '@/hooks/use-confirm'
import { ButtonLoading } from '@/components/button-custom'
import { useGetWork } from '@/features/works/api/use-get-work'
import { useEditWork } from '@/features/works/api/use-edit-work'
import { useCanceledWork } from '@/features/works/api/use-canceled-work'
import { useCompletedWork } from '@/features/works/api/use-completed-work'

import { FormWork } from '@/features/works/components/form-work'
import { convertAmountToMiliunits } from '@/lib/utils'

type Props = {
  id: string
}

export const FormEditWork = ({ id }: Props) => {
  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const workQuery = useGetWork(id)
  const editMutation = useEditWork(id)
  const canceledMutation = useCanceledWork(id)
  const completedMutation = useCompletedWork(id)

  const isPending =
    editMutation.isPending ||
    canceledMutation.isPending ||
    completedMutation.isPending

  const { data } = workQuery

  if (!data) return null

  const isNonInProgress = data.role !== 'INPROGRESS'

  const defaultValues: InsertWorkFormValues = {
    amount: String(data.amount),

    circuitBreaker: data.circuitBreaker,
    uc: data.uc,
    isAddressCustomer: data.isAddressCustomer,

    coordinates: data.coordinates,
    xLat: data.xLat,
    yLat: data.yLat,
    lat: data.lat,
    long: data.long,
    obs: data.obs,

    orderDate: data.orderDate ? new Date(data.orderDate) : null,
    equipamentArrivalDate: data.equipamentArrivalDate
      ? new Date(data.equipamentArrivalDate)
      : null,
    startDateOfWork: data.startDateOfWork
      ? new Date(data.startDateOfWork)
      : null,
    approvalDate: data.approvalDate ? new Date(data.approvalDate) : null,
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,

    address: data.address,

    customerId: data.customerId,
    responsibleId: data.responsibleId,
    designerId: data.designerId,
  }

  const onSubmit = async (values: InsertWorkFormValues) => {
    if (isNonInProgress) return

    const amount = convertAmountToMiliunits(values.amount)

    editMutation.mutate({ ...values, amount })
  }

  const onCanceled = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      canceledMutation.mutate()
    }
  }

  const onCompleted = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      completedMutation.mutate()
    }
  }

  const handleSubmit = () => {
    document
      .getElementById('form-work')
      ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }

  return (
    <>
      <ConfirmationDialog />
      <FormWork
        id={id}
        formId="form-work"
        isPending={isPending || isNonInProgress}
        blocked={isNonInProgress}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCanceled={onCanceled}
        onCompleted={onCompleted}
      />
      <ButtonLoading
        type="button"
        onClick={handleSubmit}
        disabled={isPending || isNonInProgress}
        blocked={isNonInProgress}
        className="w-fit mt-4"
      >
        Salvar
      </ButtonLoading>
    </>
  )
}
