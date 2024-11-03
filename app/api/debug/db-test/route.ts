import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET() {
  try {
    // Try to connect and perform a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`
    return NextResponse.json({ success: true, result })
  } catch (error) {
    // Type guard to check if error is an Error object
    if (error instanceof Error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Fallback for unknown error types
    return NextResponse.json(
      { success: false, error: "An unknown error occurred" },
      { status: 500 }
    )
  }
}
