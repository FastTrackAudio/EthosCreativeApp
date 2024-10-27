import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;

export async function getMostRecentCourse(userId: string) {
  return prisma.course.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getMostRecentProject(userId: string) {
  return prisma.project.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}
