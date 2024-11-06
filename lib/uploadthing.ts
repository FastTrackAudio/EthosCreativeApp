"use client"

import { generateReactHelpers } from "@uploadthing/react"
import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define a single uploader that handles all file types
  imageUploader: f({
    pdf: { maxFileSize: "32MB" },
    image: { maxFileSize: "8MB" },
    text: { maxFileSize: "8MB" },
    audio: { maxFileSize: "32MB" },
    video: { maxFileSize: "64MB" },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      return {} // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete:", file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
