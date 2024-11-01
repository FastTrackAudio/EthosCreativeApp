"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTransition } from "react"

interface ConceptCompletionStatusProps {
  conceptId: string
  isCompleted: boolean
  onComplete: (conceptId: string) => Promise<void>
}

export function ConceptCompletionStatus({
  conceptId,
  isCompleted,
  onComplete,
}: ConceptCompletionStatusProps) {
  const [isPending, startTransition] = useTransition()

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Completed
      </div>
    )
  }

  return (
    <form action={() => startTransition(() => onComplete(conceptId))}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isPending}
      >
        <CheckCircle className="h-4 w-4" />
        {isPending ? "Marking as Complete..." : "Mark as Complete"}
      </Button>
    </form>
  )
}
