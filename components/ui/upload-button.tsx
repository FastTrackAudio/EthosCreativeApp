"use client"

import { useUploadThing } from "@/lib/uploadthing"
import { useState, useCallback } from "react"
import { Button } from "./button"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface UploadButtonProps {
  onUploadComplete: (url: string) => void
  disabled?: boolean
}

export function UploadButton({
  onUploadComplete,
  disabled,
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false)
      if (res?.[0]?.url) {
        onUploadComplete(res[0].url)
        toast.success("Image uploaded successfully")
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false)
      toast.error(`Error uploading image: ${error.message}`)
    },
  })

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      await startUpload([file])
    },
    [startUpload]
  )

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isUploading || disabled}
      className="relative"
      asChild
    >
      <label>
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleUpload}
          disabled={isUploading || disabled}
        />
        <ImageIcon className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Image"}
      </label>
    </Button>
  )
}
