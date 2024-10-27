import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/app/utils/db";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { PartialBlock } from "@blocknote/core";

const BlockNoteEditorComponent = dynamic(
  () =>
    import("@/components/BlockNoteEditor").then(
      (mod) => mod.BlockNoteEditorComponent
    ),
  { ssr: false }
);

async function getConcept(conceptId: string, userId: string) {
  const concept = await prisma.concept.findUnique({
    where: {
      id: conceptId,
      section: {
        course: {
          userId: userId,
        },
      },
    },
    include: {
      section: {
        select: {
          id: true,
          courseId: true,
        },
      },
    },
  });

  if (!concept) {
    notFound();
  }

  return concept;
}

function parseContent(content: string | null): PartialBlock[] {
  if (!content) {
    return [{ type: "paragraph", content: "" }];
  }

  try {
    const parsedContent = JSON.parse(content);
    if (Array.isArray(parsedContent) && parsedContent.length > 0) {
      return parsedContent;
    }
  } catch (error) {
    console.error("Error parsing concept content:", error);
  }

  // If parsing fails or content is not an array, return default content
  return [{ type: "paragraph", content: content }];
}

export default async function ConceptPage({
  params,
}: {
  params: { courseId: string; sectionId: string; conceptId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const concept = await getConcept(params.conceptId, user.id);

  const initialContent = parseContent(concept.content as string | null);

  return (
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-4">{concept.title}</h1>
      <div className="h-[calc(100vh-150px)] w-full border border-gray-300 rounded-lg overflow-hidden">
        <BlockNoteEditorComponent
          conceptId={concept.id}
          sectionId={concept.section.id}
          courseId={concept.section.courseId}
          initialContent={initialContent}
        />
      </div>
    </div>
  );
}
