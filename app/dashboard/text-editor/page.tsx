import dynamic from "next/dynamic";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";

const BlockNoteEditorComponent = dynamic(
  () =>
    import("@/components/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditorComponent
    ),
  { ssr: false }
);

export default async function TextEditorPage({
  params,
}: {
  params: { conceptId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  const concept = await prisma.concept.findUnique({
    where: {
      id: params.conceptId,
    },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!concept) {
    return <div>Concept not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{concept.title}</h1>
      <div className="h-[calc(100vh-150px)] w-full border border-gray-300 rounded-lg overflow-hidden">
        <BlockNoteEditorComponent
          conceptId={concept.id}
          sectionId={concept.section.id}
          courseId={concept.section.course.id}
          initialContent={concept.content as any}
        />
      </div>
    </div>
  );
}
