// Basic database utilities and types
import { PrismaClient } from "@prisma/client"

type GlobalWithPrisma = typeof globalThis & {
  prisma: PrismaClient | undefined
}

export const prisma =
  (globalThis as GlobalWithPrisma).prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  ;(globalThis as GlobalWithPrisma).prisma = prisma
}

export default prisma
