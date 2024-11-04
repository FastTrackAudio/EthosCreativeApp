import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  try {
    const { getUser, getPermissions } = getKindeServerSession();
    const user = await getUser();
    const permissions = await getPermissions();
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Check if user has admin permission
    const isAdmin = permissions?.permissions?.includes("admin:all");

    // If admin and no specific userId requested, return all courses
    if (isAdmin && !queryUserId) {
      const courses = await prisma.course.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              sections: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(courses);
    }

    // Otherwise, filter by the requested userId or the current user's id
    const courses = await prisma.course.findMany({
      where: {
        userId: queryUserId || user?.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
