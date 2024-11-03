import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditProfilePage() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    redirect("/auth/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      artistType: true,
      workType: true,
      skills: true,
      socialLinks: true,
      achievements: true,
      featuredWorks: true,
    },
  })

  if (!dbUser) {
    redirect("/auth/login")
  }

  const formattedUser = {
    ...dbUser,
    bio: dbUser.bio ?? "",
    socialLinks: dbUser.socialLinks as {
      website?: string
      twitter?: string
      instagram?: string
      linkedin?: string
      github?: string
      youtube?: string
    },
    skills: Array.isArray(dbUser.skills) ? dbUser.skills : [],
    achievements: dbUser.achievements as {
      title: string
      description: string
      date: string
    }[],
    featuredWorks: dbUser.featuredWorks as {
      title: string
      description: string
      link: string
      image?: string
    }[],
    artistType: dbUser.artistType ?? undefined,
    workType: dbUser.workType ?? undefined,
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)]">
      <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]">
        <div className="container max-w-4xl py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
            Edit Profile
          </h1>
          <p className="text-[color:var(--color-text-light)] mt-2">
            Customize how others see you on the platform
          </p>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="bg-[color:var(--color-surface-elevated)] rounded-lg border border-[color:var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <EditProfileForm user={formattedUser} />
        </div>
      </div>
    </div>
  )
}
