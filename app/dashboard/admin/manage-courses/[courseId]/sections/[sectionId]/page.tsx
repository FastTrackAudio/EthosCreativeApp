import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { notFound } from "next/navigation";
import { ConceptList } from "../../../../../../../features/courses/concepts/ConceptList";
import { CreateConceptForm } from "../../../../../../../features/courses/concepts/CreateConceptForm";
import Link from "next/link";

async function getSection(sectionId: string, userId: string) {
  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
      course: {
        userId: userId,
      },
    },
    include: {
      concepts: {
        orderBy: { createdAt: "asc" },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  return section;
}

export default async function SectionPage({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const section = await getSection(params.sectionId, user.id);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{section.title}</h1>
      <p className="mb-4">{section.description}</p>
      <ConceptList initialConcepts={section.concepts} sectionId={section.id} />
      <CreateConceptForm sectionId={section.id} />
      <div>
        {section.concepts.map((concept) => (
          <Link
            key={concept.id}
            href={`/dashboard/my-courses/${params.courseId}/sections/${params.sectionId}/concepts/${concept.id}`}
          >
            {concept.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
