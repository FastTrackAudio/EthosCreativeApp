import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

/**
 * Returns a list of user IDs from a partial search input
 * For `resolveMentionSuggestions` in liveblocks.config.ts
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text") as string

  const filteredUserIds = prisma.user
    .findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: text,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: text,
              mode: "insensitive",
            },
          },
        ],
      },
    })
    .then((users: Array<{ id: string }>) => users.map((user) => user.id))

  return NextResponse.json(filteredUserIds)
}
