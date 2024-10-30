import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const enrolledCourses = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                _count: {
                  select: {
                    concepts: true,
                  },
                },
              },
            },
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedCourses = enrolledCourses.map((enrollment) => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      createdAt: enrollment.course.createdAt.toISOString(),
      updatedAt: enrollment.course.updatedAt.toISOString(),
      sectionCount: enrollment.course.sections.length,
      conceptCount: enrollment.course.sections.reduce(
        (acc: number, section: any) => acc + (section._count?.concepts || 0),
        0
      ),
      studentCount: enrollment.course.enrollments.length,
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("[ENROLLED_COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
