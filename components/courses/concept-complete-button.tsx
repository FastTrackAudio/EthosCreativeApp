"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTransition } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ConceptCompleteButtonProps {
  conceptId: string
  courseId: string
  onComplete: (isCompleting: boolean) => void
}

export function ConceptCompleteButton({
  conceptId,
  courseId,
  onComplete,
}: ConceptCompleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  // Query to get completion status
  const { data: completionStatus } = useQuery({
    queryKey: ["concept-completion", conceptId],
    queryFn: async () => {
      const response = await axios.get(`/api/concepts/${conceptId}/completion`)
      return response.data
    },
  })

  // Mutation to update completion status
  const completeMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/concepts/${conceptId}/toggle-complete`)
    },
    onSuccess: (_, variables) => {
      const isCompleting = !completionStatus?.completed
      toast.success(isCompleting ? "Concept marked as complete" : "Concept marked as incomplete")
      queryClient.invalidateQueries({
        queryKey: ["concept-completion", conceptId],
      })
      onComplete(isCompleting)
    },
    onError: () => {
      toast.error("Failed to update completion status")
    },
  })

  if (completionStatus?.completed) {
    return (
      <Button
        onClick={() => completeMutation.mutate()}
        size="sm"
        variant="outline"
        className="gap-2"
        disabled={isPending || completeMutation.isPending}
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        Completed
      </Button>
    )
  }

  return (
    <Button
      onClick={() => completeMutation.mutate()}
      size="sm"
      variant="default"
      className="gap-2"
      disabled={isPending || completeMutation.isPending}
    >
      <CheckCircle className="h-4 w-4" />
      {completeMutation.isPending ? "Marking as Complete..." : "Mark as Complete"}
    </Button>
  )
}
