import { convertAmountToMiliunits } from '@/lib/utils'

import {
  insertTransactionDefaultValues,
  InsertTransactionFormValues,
  InsertTransactionSchema,
} from '@/features/works/transactions/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useNewTransaction } from '@/features/works/transactions/hooks/use-new-transaction'
import { useCreateTransaction } from '@/features/works/transactions/api/use-create-transaction'

import { FormTransaction } from '@/features/works/transactions/components/form-transaction'

export const FormNewTransaction = () => {
  const { isOpen, onClose, workId, isExpenses } = useNewTransaction()

  const mutation = useCreateTransaction(workId)
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('transactions')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('transactions')
  const isPending = mutation.isPending || uploadMultiplePending || uploadPending

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
    mutation.mutate(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <FormTransaction
      isOpen={isOpen}
      isPending={isPending}
      isExpenses={isExpenses}
      defaultValues={insertTransactionDefaultValues}
      handleClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
