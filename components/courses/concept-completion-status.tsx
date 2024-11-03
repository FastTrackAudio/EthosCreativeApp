"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useTransition } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface ConceptCompletionStatusProps {
  conceptId: string
}

export function ConceptCompletionStatus({
  conceptId,
}: ConceptCompletionStatusProps) {
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
      await axios.post(`/api/concepts/${conceptId}/complete`)
    },
    onSuccess: () => {
      toast.success("Concept marked as complete")
      queryClient.invalidateQueries({
        queryKey: ["concept-completion", conceptId],
      })
    },
    onError: () => {
      toast.error("Failed to mark concept as complete")
    },
  })

  if (completionStatus?.completed) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Completed
      </div>
    )
  }

  return (
    <form action={() => startTransition(() => completeMutation.mutate())}>
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
