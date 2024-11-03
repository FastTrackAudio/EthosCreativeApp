import { ArtistProfileHeader } from "@/components/artist-profile/artist-profile-header"
import { ArtistProfileSidebar } from "@/components/artist-profile/artist-profile-sidebar"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export default async function ArtistProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { customUrl: string }
}) {
  const { getUser } = getKindeServerSession()
  const currentUser = await getUser()

  // Fetch user data by either customUrl or artistPageUrl
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { customUrl: params.customUrl },
        { artistPageUrl: params.customUrl },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      artistType: true,
      workType: true,
      customUrl: true,
      artistPageUrl: true,
      bio: true,
      skills: true,
      socialLinks: true,
      achievements: true,
      featuredWorks: true,
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        take: 3,
      },
    },
  })

  if (!user) {
    redirect("/404")
  }

  // Parse socialLinks from JSON if needed
  const parsedSocialLinks =
    typeof user.socialLinks === "string"
      ? JSON.parse(user.socialLinks as string)
      : user.socialLinks || {}

  // Parse other JSON fields if needed
  const parsedSkills =
    typeof user.skills === "string"
      ? JSON.parse(user.skills as string)
      : user.skills || []

  const parsedAchievements =
    typeof user.achievements === "string"
      ? JSON.parse(user.achievements as string)
      : user.achievements || []

  const parsedFeaturedWorks =
    typeof user.featuredWorks === "string"
      ? JSON.parse(user.featuredWorks as string)
      : user.featuredWorks || []

  // Check if the current user is viewing their own profile
  const isOwner = currentUser?.id === user.id

  const userWithParsedData = {
    ...user,
    socialLinks: parsedSocialLinks,
    skills: parsedSkills,
    achievements: parsedAchievements,
    featuredWorks: parsedFeaturedWorks,
    isOwner,
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface)]">
      <ArtistProfileHeader user={userWithParsedData} />
      <div className="container max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
          <ArtistProfileSidebar user={userWithParsedData} />
          <main className="space-y-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
