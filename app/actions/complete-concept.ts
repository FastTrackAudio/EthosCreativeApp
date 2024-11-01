"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/utils/db"
import { revalidatePath } from "next/cache"

export async function completeConceptAction(
  conceptId: string,
  courseId: string
) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  try {
    await prisma.userCurriculum.upsert({
      where: {
        userId_courseId_conceptId: {
          userId: user.id,
          courseId: courseId,
          conceptId: conceptId,
        },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId: user.id,
        courseId: courseId,
        conceptId: conceptId,
        weekId: "1",
        order: 0,
        isCompleted: true,
      },
    })

    revalidatePath(`/dashboard/my-courses/${courseId}`)
  } catch (error) {
    console.error("Failed to complete concept:", error)
    throw new Error("Failed to complete concept")
  }
}
