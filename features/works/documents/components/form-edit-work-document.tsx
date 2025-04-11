import {
  InsertDocumentInWorkFormValues,
  InsertDocumentInWorkSchema,
} from '@/features/works/documents/schema'
import { InsertDocumentFormValues } from '@/features/common/schema'

import {
  useUploadFile,
  useUploadMultipleFiles,
} from '@/features/common/api/use-upload-file'
import { useGetWorkDocuments } from '@/features/works/documents/api/use-get-work-documents'
import { useEditWorkDocuments } from '@/features/works/documents/api/use-edit-work-documents'

import { Loader } from '@/components/loader'
import { FormWorkDocuments } from '@/features/works/documents/components/form-work-documents'

type Props = {
  id: string
}

export const FormEditWorkDocument = ({ id }: Props) => {
  const equipamentQuery = useGetWorkDocuments(id)
  const editMutation = useEditWorkDocuments(id)
  const { mutateAsync: uploadFiles, isPending: uploadMultiplePending } =
    useUploadMultipleFiles('works')
  const { mutateAsync: uploadFile, isPending: uploadPending } =
    useUploadFile('works')

  const isLoading = equipamentQuery.isLoading

  if (isLoading) {
    return <Loader />
  }

  const isPending =
    editMutation.isPending || uploadMultiplePending || uploadPending

  const { data } = equipamentQuery

  if (!data) return null

  const isNonInProgress = data.role !== 'INPROGRESS'

  const defaultValues: InsertDocumentInWorkFormValues = {
    documents: data.documents,
  }

  const onSubmit = async (values: InsertDocumentInWorkFormValues) => {
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
          documents: allDocuments,
        })
      } else {
        handleSubmit({
          documents: storedDocuments,
        })
      }
    } else {
      handleSubmit({
        documents: null,
      })
    }
  }

  const handleSubmit = (values: InsertDocumentInWorkSchema) => {
    editMutation.mutate(values)
  }

  return (
    <FormWorkDocuments
      isPending={isPending || isNonInProgress}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />
  )
}
