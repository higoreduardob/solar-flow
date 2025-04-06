import { v2 as cloudinary } from 'cloudinary'

import { InsertDocumentFormValues } from '@/features/common/schema'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadFile(
  file: File,
  folder?: string,
): Promise<InsertDocumentFormValues> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: generateRandomFileName(),
        overwrite: false,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        if (!result) {
          return reject(new Error('Upload do arquivo sem resultado'))
        }
        resolve({
          name: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          type: result.format,
          size: String(result.bytes), // TODO: Calculate MB or kB
        })
      },
    )

    uploadStream.end(buffer)
  })
}

interface DestroyResult {
  result: string
}

export async function destroyFile(publicId: string): Promise<DestroyResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(error)
      }
      if (!result) {
        return reject(new Error('Remoção do arquivo sem resultado'))
      }
      resolve({
        result: result.result,
      })
    })
  })
}

function generateRandomFileName(): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  return `file_${timestamp}_${randomString}`
}

export async function managerFile(folder: string, publicId: string) {
  try {
    const urlParts = publicId.split('/')
    const publicIdWithExtension = urlParts[urlParts.length - 1]
    const fileName = publicIdWithExtension.split('.')[0]
    const oldPublicId = `${folder}/${fileName}`

    const destroyResult = await destroyFile(oldPublicId)
    if (destroyResult.result !== 'ok') {
      throw new Error('Falha ao remover arquivo antigo')
    }
  } catch (error) {
    throw new Error('Falha ao remover arquivo antigo')
  }
}

export async function filterFiles(
  files: InsertDocumentFormValues[] | null | undefined,
  documents: { publicId: string }[] | undefined,
) {
  const fileIds = new Set(files?.map((file) => file.publicId))
  const documentIds = new Set(documents?.map((document) => document.publicId))

  const [toAdd, toRemove] = await Promise.all([
    files?.filter((file) => !documentIds.has(file.publicId)),
    documents
      ?.filter((doc) => !fileIds.has(doc.publicId))
      .map((doc) => doc.publicId),
  ])

  return { toAdd, toRemove }
}
