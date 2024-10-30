import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Concept = {
  id: string
  title: string
  content: string
}

interface KanbanCardProps {
  concept: Concept
  courseId: string
  sectionId: string
  isAdminView?: boolean
}

export function KanbanCard({
  concept,
  courseId,
  sectionId,
  isAdminView = false,
}: KanbanCardProps) {
  const href = isAdminView
    ? `/dashboard/admin/manage-courses/${courseId}/sections/${sectionId}/concepts/${concept.id}`
    : `/dashboard/my-courses/${courseId}/sections/${sectionId}/concepts/${concept.id}`

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{concept.title}</CardTitle>
        <Link href={href}>
          <Button variant="outline" size="sm">
            {isAdminView ? "Edit" : "View"}
          </Button>
        </Link>
      </CardHeader>
    </Card>
  )
}
