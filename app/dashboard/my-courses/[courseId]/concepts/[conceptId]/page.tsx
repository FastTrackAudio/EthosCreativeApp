import { ConceptContent } from "@/components/courses/concept-content"
import { redirect } from "next/navigation"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/utils/db"
import { revalidatePath } from "next/cache"
import { ConceptCompleteButton } from "@/components/courses/concept-complete-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ConceptViewerPage({
  params,
}: {
  params: { courseId: string; conceptId: string }
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the concept and check if it's already completed
  const concept = await prisma.concept.findFirst({
    where: {
      id: params.conceptId,
      section: {
        course: {
          enrollments: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
    include: {
      section: {
        select: {
          courseId: true,
          title: true,
        },
      },
      curriculum: {
        where: {
          userId: user.id,
          courseId: params.courseId,
          conceptId: params.conceptId,
          isCompleted: true,
        },
      },
    },
  })

  if (!concept) {
    redirect("/dashboard/my-courses")
  }

  const isCompleted = concept.curriculum.length > 0
  const courseId = concept.section.courseId

  async function handleComplete() {
    "use server"

    try {
      if (!isCompleted) {
        // Create or update the curriculum entry for this specific concept
        await prisma.userCurriculum.upsert({
          where: {
            userId_courseId_conceptId: {
              userId: user.id,
              courseId: courseId,
              conceptId: params.conceptId,
            },
          },
          update: {
            isCompleted: true,
          },
          create: {
            userId: user.id,
            courseId: courseId,
            conceptId: params.conceptId,
            weekId: "1",
            order: 0,
            isCompleted: true,
          },
        })
      }

      revalidatePath(`/dashboard/my-courses/${courseId}`)
      redirect(`/dashboard/my-courses/${courseId}`)
    } catch (error) {
      console.error("Failed to complete concept:", error)
      throw new Error("Failed to complete concept")
    }
  }

  return (
    <div className="grid grid-rows-[auto,1fr] min-h-screen">
      {/* Navigation Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-14 max-w-6xl">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/my-courses/${courseId}`}
              className="flex items-center text-sm font-medium"
            >
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              {concept.section.title}
            </div>
          </div>

          <ConceptCompleteButton
            conceptId={params.conceptId}
            courseId={courseId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <ConceptContent
          conceptId={params.conceptId}
          courseId={courseId}
          editorMode={false}
        />
      </div>
    </div>
  )
}
