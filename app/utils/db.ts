import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

export async function getMostRecentCourse(userId: string) {
  return prisma.course.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getMostRecentProject(userId: string) {
  return prisma.project.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  })
}
