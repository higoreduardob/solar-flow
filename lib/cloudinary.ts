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
          size: String(result.bytes),
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
