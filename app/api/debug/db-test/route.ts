import { NextResponse } from "next/server"
import prisma from "@/app/utils/db"

export async function GET() {
  try {
    // Try to connect and perform a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
