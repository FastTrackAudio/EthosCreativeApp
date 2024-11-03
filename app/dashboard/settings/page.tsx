import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CustomUrlManager } from "@/components/profile/custom-url-manager"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    redirect("/auth/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  })

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile settings and custom URL
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Custom Profile URL</h2>
            <CustomUrlManager
              currentUrl={dbUser?.customUrl || null}
              userId={user.id}
              type="artist"
            />
          </div>
          {/* Add other settings sections here */}
        </div>
      </div>
    </div>
  )
}
