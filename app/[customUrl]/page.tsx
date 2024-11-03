import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Palette,
  Trophy,
  Sparkles,
  BookOpen,
  Star,
  GraduationCap,
} from "lucide-react"

export default async function PublicProfilePage({
  params,
}: {
  params: { customUrl: string }
}) {
  const user = await prisma.user.findUnique({
    where: {
      customUrl: params.customUrl,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      bio: true,
      artistType: true,
      workType: true,
      skills: true,
      achievements: true,
      featuredWorks: true,
      socialLinks: true,
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

  const formatEnumValue = (value: string) => {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1))
      .join(" ")
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Artist Type & Work Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.artistType && (
              <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="h-5 w-5 text-[color:var(--color-accent)]" />
                  <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                    Artist Type
                  </h2>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2 mb-4">
                  {formatEnumValue(user.artistType)}
                </Badge>
                <p className="text-[color:var(--color-text-light)]">
                  {getArtistTypeDescription(user.artistType)}
                </p>
              </Card>
            )}

            {user.workType && (
              <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-[color:var(--color-accent)]" />
                  <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                    Creative Style
                  </h2>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2 mb-4">
                  {formatEnumValue(user.workType)}
                </Badge>
                <p className="text-[color:var(--color-text-light)]">
                  {getWorkTypeDescription(user.workType)}
                </p>
              </Card>
            )}
          </div>

          {/* Featured Works */}
          {user.featuredWorks && (
            <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
              <div className="flex items-center gap-3 mb-6">
                <Star className="h-5 w-5 text-[color:var(--color-accent)]" />
                <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                  Featured Works
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map through featured works */}
                {Array.isArray(user.featuredWorks) &&
                  user.featuredWorks.map((work: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-medium text-[color:var(--color-text)]">
                        {work.title}
                      </h3>
                      <p className="text-sm text-[color:var(--color-text-light)]">
                        {work.description}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Achievements */}
          {user.achievements && (
            <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-5 w-5 text-[color:var(--color-accent)]" />
                <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                  Achievements
                </h2>
              </div>
              <div className="grid gap-4">
                {Array.isArray(user.achievements) &&
                  user.achievements.map((achievement: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]"
                    >
                      <h3 className="font-medium text-[color:var(--color-text)]">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-[color:var(--color-text-light)] mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Learning Journey */}
          {user.enrollments.length > 0 && (
            <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-5 w-5 text-[color:var(--color-accent)]" />
                <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                  Learning Journey
                </h2>
              </div>
              <div className="grid gap-4">
                {user.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-[color:var(--color-text)]">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-light)] mt-1">
                          {enrollment.course.description}
                        </p>
                      </div>
                      <BookOpen className="h-5 w-5 text-[color:var(--color-text-lightest)]" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bio */}
          <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
            <h2 className="font-semibold text-[color:var(--color-text)] mb-4">
              About
            </h2>
            <p className="text-[color:var(--color-text-light)]">{user.bio}</p>
          </Card>

          {/* Skills */}
          {user.skills.length > 0 && (
            <Card className="p-6 bg-[color:var(--color-surface-elevated)]">
              <h2 className="font-semibold text-[color:var(--color-text)] mb-4">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions for descriptions
function getArtistTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    VISIONARY:
      "An innovative creator who pushes boundaries and explores new possibilities in art.",
    CONSUMMATE_PROFESSIONAL:
      "A disciplined artist who maintains high standards and professional excellence.",
    ANALYZER:
      "A methodical artist who approaches creation with analytical precision.",
    TECH_ARTIST:
      "A digital native who combines technology and creativity seamlessly.",
    ENTERTAINER:
      "A charismatic creator who brings joy and engagement to their art.",
    MAVERICK: "An independent thinker who charts their own creative path.",
    DREAMER: "A visionary who transforms imagination into artistic reality.",
    FEELER: "An emotionally intuitive artist who creates from the heart.",
    TORTURED: "A deep thinker who channels complexity into powerful art.",
    SOLO: "An independent creator who excels in solitary artistic pursuit.",
  }
  return descriptions[type] || "A unique and talented artist."
}

function getWorkTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    ENTREPRENEUR:
      "A self-driven creative who builds and manages artistic ventures.",
    TEAM_PLAYER:
      "A collaborative artist who thrives in group settings and shared projects.",
    CONNECTOR_ORGANIZER:
      "A natural networker who brings creative people and projects together.",
    FINISHER:
      "A detail-oriented creator who ensures projects reach completion.",
    ENTHUSIASTIC_FACILITATOR:
      "An energetic leader who enables creative success in others.",
    CREATIVE_INITIATOR: "A starter who sparks new artistic ideas and projects.",
    COLLABORATOR:
      "A partnership-focused artist who excels in creative teamwork.",
  }
  return descriptions[type] || "A dedicated creative professional."
}
