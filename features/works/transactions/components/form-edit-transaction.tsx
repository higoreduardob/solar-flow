import { convertAmountToMiliunits } from '@/lib/utils'

import {
  InsertTransactionFormValues,
  InsertTransactionSchema,
} from '@/features/works/transactions/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useConfirm } from '@/hooks/use-confirm'
import { useGetTransaction } from '@/features/works/transactions/api/use-get-transaction'
import { useEditTransaction } from '@/features/works/transactions/api/use-edit-transaction'
import { useOpenTransaction } from '@/features/works/transactions/hooks/use-open-transaction'
import { useDeleteTransaction } from '@/features/works/transactions/api/use-delete-transaction'

import { FormTransaction } from '@/features/works/transactions/components/form-transaction'

export const FormEditTransaction = () => {
  const { id, workId, isOpen, isExpenses, onClose } = useOpenTransaction()

  const [ConfirmationDialog, confirm] = useConfirm(
    'Deseja realmente continuar?',
    'Após efetuar essa ação, não poderá ser revertida.',
  )

  const transactionQuery = useGetTransaction(id)
  const editMutation = useEditTransaction(id, workId)
  const deleteMutation = useDeleteTransaction(id)
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('transactions')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('transactions')

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    uploadMultiplePending ||
    uploadPending

  const { data } = transactionQuery

  if (!data) return null

  const defaultValues: InsertTransactionFormValues = {
    name: data.name,
    amount: String(data.amount),
    documents: data.documents,
  }

  const isNonInProgress = data.work.role !== 'INPROGRESS'

  const onSubmit = async (values: InsertTransactionFormValues) => {
    const amount = convertAmountToMiliunits(values.amount)
    const { documents } = values

    if (documents && documents.length > 0) {
      const documentsToUpload = documents.filter(
        (document): document is File => document instanceof File,
      )
      const storedDocuments = documents.filter(
        (document): document is InsertDocumentFormValues =>
          document !== null &&
          document !== undefined &&
          !(document instanceof File),
      ) as InsertDocumentFormValues[]

      if (documentsToUpload.length > 0) {
        const uploadedDocumentsRaw =
          documentsToUpload.length === 1
            ? await uploadFile({
                file: documentsToUpload[0],
              })
            : await uploadFiles({
                files: documentsToUpload,
              })

        const uploadedDocuments = Array.isArray(uploadedDocumentsRaw)
          ? uploadedDocumentsRaw
          : [uploadedDocumentsRaw]

        const allDocuments = [...uploadedDocuments, ...storedDocuments]

        handleSubmit({
          ...values,
          amount,
          documents: allDocuments,
        })
      } else {
        handleSubmit({
          ...values,
          amount,
          documents: storedDocuments,
        })
      }
    } else {
      handleSubmit({
        ...values,
        amount,
        documents: null,
      })
    }
  }

  const handleSubmit = (values: InsertTransactionSchema) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  const handleDelete = async () => {
    if (isNonInProgress) return

    const ok = await confirm()

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose()
        },
      })
    }
  }

  return (
    <>
      <ConfirmationDialog />
      <FormTransaction
        id={id}
        isOpen={isOpen}
        isPending={isPending || isNonInProgress}
        isExpenses={isExpenses}
        defaultValues={defaultValues}
        handleClose={onClose}
        onSubmit={onSubmit}
        onDelete={handleDelete}
      />
    </>
  )
}
