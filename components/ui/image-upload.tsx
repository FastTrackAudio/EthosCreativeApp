"use client"

import { useDropzone } from "react-dropzone"
import { useCallback, useState } from "react"
import { generateClientDropzoneAccept } from "uploadthing/client"
import { useUploadThing } from "@/lib/uploadthing"
import { Upload, X } from "lucide-react"
import { Button } from "./button"

interface ImageUploadProps {
  value?: string
  onChange: (url?: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      onChange(res?.[0].url)
      setIsUploading(false)
    },
    onUploadError: () => {
      setIsUploading(false)
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsUploading(true)
      startUpload(acceptedFiles)
    },
    [startUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*"]),
    maxFiles: 1,
    disabled: disabled || isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed border-[var(--color-border)] 
        rounded-lg p-4 text-center cursor-pointer 
        hover:border-[var(--color-border-contrasted)] transition-colors
        ${isDragActive ? "border-primary" : ""}
        ${disabled || isUploading ? "opacity-50 cursor-default" : ""}
      `}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="max-h-[200px] mx-auto rounded-lg"
          />
          {!disabled && !isUploading && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-[var(--color-text-light)]">
          <Upload className="h-8 w-8" />
          <div className="text-sm">
            {isUploading
              ? "Uploading..."
              : "Drag & drop an image here, or click to select"}
          </div>
        </div>
      )}
    </div>
  )
}
