'use client'

import {
  X,
  Upload,
  FileIcon,
  FileText,
  Image,
  File,
  Download,
} from 'lucide-react'
import type React from 'react'
import { useDropzone } from 'react-dropzone'
import { useCallback, useState, useEffect } from 'react'

import { MaxFileSize } from '@/constants'

import { cn } from '@/lib/utils'

import {
  InsertDocumentFormValues,
  InsertFileOrDocumentFormValues,
} from '@/features/common/schema'

import { Button } from '@/components/ui/button'
import { FormControl } from '@/components/ui/form'

type FileOrDocument = File | InsertDocumentFormValues

const isStoredFile = (
  file: FileOrDocument,
): file is InsertDocumentFormValues => {
  return 'url' in file && typeof file.url === 'string'
}

interface InputFileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?:
    | FileOrDocument
    | null
    | (FileOrDocument | null | undefined)[]
    | undefined
  onChange?: (
    file: FileOrDocument | null | (FileOrDocument | null)[] | undefined,
  ) => void
  multiple?: boolean
  accept?: Record<string, string[]>
  maxSize?: number
  disabled?: boolean
}

export const fileTypeIcons: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="h-4 w-4 text-red-500" />,
  'image/png': <Image className="h-4 w-4 text-blue-500" />,
  'image/jpeg': <Image className="h-4 w-4 text-blue-500" />,
  'image/jpg': <Image className="h-4 w-4 text-blue-500" />,
  'image/webp': <Image className="h-4 w-4 text-blue-500" />,
  'application/msword': <FileIcon className="h-4 w-4 text-blue-500" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
    <FileIcon className="h-4 w-4 text-blue-500" />
  ),
  'application/vnd.dwg': <FileIcon className="h-4 w-4 text-orange-500" />,
  default: <File className="h-4 w-4" />,
}

const getFileTypeFromName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  if (!extension) return 'application/octet-stream'

  const extensionMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dwg: 'application/vnd.dwg',
  }

  return extensionMap[extension] || 'application/octet-stream'
}

export function InputFile({
  value,
  onChange,
  multiple = false,
  accept = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
    'application/vnd.dwg': ['.dwg'],
  },
  maxSize = MaxFileSize,
  disabled = false,
  className,
  ...props
}: InputFileProps) {
  const [files, setFiles] = useState<FileOrDocument[]>(() => {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is FileOrDocument => item !== null && item !== undefined,
      )
    }
    return value ? [value] : []
  })

  const [rejectedFiles, setRejectedFiles] = useState<File[]>([])

  useEffect(() => {
    if (!value) {
      setFiles([])
    } else if (Array.isArray(value)) {
      setFiles(
        value.filter(
          (item): item is FileOrDocument => item !== null && item !== undefined,
        ),
      )
    } else {
      setFiles(value ? [value] : [])
    }
  }, [value])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejected: any[]) => {
      if (rejected.length > 0) {
        setRejectedFiles(rejected.map((r) => r.file))
        setTimeout(() => setRejectedFiles([]), 3000)
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      )

      if (multiple) {
        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onChange?.(updatedFiles)
      } else {
        setFiles(newFiles)
        onChange?.(newFiles[0] || null)
      }
    },
    [files, multiple, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  })

  const removeFile = (fileToRemove: InsertFileOrDocumentFormValues) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove)
    setFiles(updatedFiles)

    if (multiple) {
      onChange?.(updatedFiles.length > 0 ? updatedFiles : null)
    } else {
      onChange?.(null)
    }
  }

  const handleDownload = (file: InsertFileOrDocumentFormValues) => {
    if (isStoredFile(file)) {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if ('preview' in file) {
      const link = document.createElement('a')
      link.href = file.preview as string
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getFileIcon = (file: InsertFileOrDocumentFormValues) => {
    if (isStoredFile(file)) {
      const fileType = file.type || getFileTypeFromName(file.name)
      return fileTypeIcons[fileType] || fileTypeIcons.default
    } else {
      return fileTypeIcons[file.type] || fileTypeIcons.default
    }
  }

  return (
    <FormControl>
      <div className={cn('space-y-2', className)} {...props}>
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            rejectedFiles.length > 0 && 'border-destructive bg-destructive/5',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-1 text-sm">
            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
            {isDragActive ? (
              <p>Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="font-medium">
                  Arraste e solte arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Suporta: PDF, PNG, JPG, WEBP, DOC, DOCX, DWG (máx. 512kB)
                </p>
              </>
            )}
          </div>
        </div>

        {rejectedFiles.length > 0 && (
          <div className="text-xs text-destructive mt-1">
            Arquivo(s) rejeitado(s): tipo ou tamanho inválido (máx. 512kB)
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-md bg-background"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(file)}
                  <span className="text-sm truncate w-full max-w-[150px] sm:max-w-[400px]">
                    {/* TODO: Fix this width */}
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Baixar</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FormControl>
  )
}
