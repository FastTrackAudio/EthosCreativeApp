"use client"

import { UploadButton } from "./upload-button"

interface ImageUploadButtonProps {
  onUploadComplete: (url: string) => void
  disabled?: boolean
}

export function ImageUploadButton({
  onUploadComplete,
  disabled,
}: ImageUploadButtonProps) {
  return (
    <UploadButton onUploadComplete={onUploadComplete} disabled={disabled} />
  )
}
