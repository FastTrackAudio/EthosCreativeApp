import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        artistPageUrl: true,
        profileImage: true,
        enrollments: {
          where: {
            courseId: params.courseId,
          },
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
    });

    const transformedUsers = users.map((user) => ({
      ...user,
      enrollment: user.enrollments[0] || null,
      enrollments: undefined,
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("[COURSE_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
