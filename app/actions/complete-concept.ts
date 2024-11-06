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
    // Check if completion exists
    const existingCompletion = await prisma.conceptCompletion.findFirst({
      where: {
        conceptId: conceptId,
        userId: user.id,
      },
    });

    await prisma.$transaction([
      // Update or create curriculum entry
      prisma.userCurriculum.upsert({
        where: {
          userId_courseId_conceptId: {
            userId: user.id,
            courseId: courseId,
            conceptId: conceptId,
          },
        },
        update: {
          isCompleted: !existingCompletion, // Toggle the completion status
        },
        create: {
          userId: user.id,
          courseId: courseId,
          conceptId: conceptId,
          weekId: "1",
          order: 0,
          isCompleted: true,
        },
      }),
      // Handle completion record
      existingCompletion 
        ? prisma.conceptCompletion.delete({
            where: {
              id: existingCompletion.id,
            },
          })
        : prisma.conceptCompletion.create({
            data: {
              userId: user.id,
              conceptId: conceptId,
            },
          }),
    ]);

    revalidatePath(`/dashboard/my-courses/${courseId}`)
  } catch (error) {
    console.error("Failed to complete concept:", error)
    throw new Error("Failed to complete concept")
  }
}
