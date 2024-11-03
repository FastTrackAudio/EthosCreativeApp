import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user) throw new Error("Unauthorized")

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
