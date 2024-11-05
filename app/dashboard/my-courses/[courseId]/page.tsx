import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { notFound, redirect } from "next/navigation";
import { EnrolledCourseView } from "@/components/courses/enrolled-course-view";
import { completeConceptAction } from "@/app/actions/complete-concept";

async function getCourseData(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      enrollments: {
        some: {
          userId,
        },
      },
    },
    include: {
      sections: {
        orderBy: {
          order: "asc",
        },
        include: {
          concepts: {
            orderBy: {
              order: "asc",
            },
            include: {
              curriculum: {
                where: {
                  userId,
                  courseId,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Transform data for the UI
  const sections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    concepts: section.concepts.map((concept) => {
      // Check if this concept has a curriculum entry for this user and course
      const isCompleted = concept.curriculum.some(
        (curr) => curr.userId === userId && curr.courseId === courseId
      );

      return {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        imageUrl: concept.imageUrl,
        completed: isCompleted,
        order: concept.order,
        sectionTitle: section.title,
      };
    }),
  }));

  return {
    courseId: course.id,
    courseTitle: course.title,
    courseDescription: course.description,
    sections,
  };
}

export default async function EnrolledCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const courseData = await getCourseData(params.courseId, user.id);

  return (
    <EnrolledCourseView
      {...courseData}
      onCompleteAction={completeConceptAction}
    />
  );
}
