import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CustomUrlManager } from "@/components/profile/custom-url-manager"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    redirect("/auth/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect("/auth/login")
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
              Profile
            </h1>
            <p className="text-[color:var(--color-text-light)]">
              Manage your profile and public presence
            </p>
          </div>
          {dbUser.artistPageUrl && (
            <Button asChild variant="outline" className="gap-2">
              <Link
                href={`/${dbUser.artistPageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Public Profile
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid gap-8">
          {/* Basic Info */}
          <div className="space-y-4 p-6 bg-[color:var(--color-surface-elevated)] rounded-lg border border-[color:var(--color-border)]">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                Basic Information
              </h2>
              <p className="text-[color:var(--color-text-light)]">
                Your public profile information
              </p>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-[color:var(--color-text)]">
                  Name
                </label>
                <p className="text-[color:var(--color-text-light)]">
                  {dbUser.firstName} {dbUser.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[color:var(--color-text)]">
                  Email
                </label>
                <p className="text-[color:var(--color-text-light)]">
                  {dbUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Artist Profile URL Section */}
          <div className="space-y-4 p-6 bg-[color:var(--color-surface-elevated)] rounded-lg border border-[color:var(--color-border)]">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                Artist Profile URL
              </h2>
              <p className="text-[color:var(--color-text-light)]">
                Customize your public profile URL
              </p>
            </div>
            <CustomUrlManager
              currentUrl={dbUser.artistPageUrl}
              userId={user.id}
              type="artist"
              label="Profile URL"
              description="Choose a unique URL for your public artist profile"
            />
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-4 p-6 bg-[color:var(--color-surface-elevated)] rounded-lg border border-[color:var(--color-border)]">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                Enrolled Courses
              </h2>
              <p className="text-[color:var(--color-text-light)]">
                Courses you're currently enrolled in
              </p>
            </div>
            <div className="grid gap-4">
              {dbUser.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="p-4 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]"
                >
                  <h3 className="font-medium text-[color:var(--color-text)]">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-[color:var(--color-text-light)]">
                    {enrollment.course.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
