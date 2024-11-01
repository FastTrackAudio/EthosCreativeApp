"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTransition } from "react"

interface ConceptCompleteButtonProps {
  onComplete: () => Promise<void>
  isCompleted: boolean
}

export function ConceptCompleteButton({
  onComplete,
  isCompleted,
}: ConceptCompleteButtonProps) {
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
    <form action={() => startTransition(() => onComplete())}>
      <Button
        type="submit"
        size="sm"
        variant="default"
        className="gap-2"
        disabled={isPending}
      >
        <CheckCircle className="h-4 w-4" />
        {isPending ? "Marking as Complete..." : "Mark as Complete"}
      </Button>
    </form>
  )
}
