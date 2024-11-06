"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"

interface ConceptCompleteButtonProps {
  conceptId: string
  courseId: string
  onComplete?: (isCompleting: boolean) => void
}

export function ConceptCompleteButton({
  conceptId,
  courseId,
  onComplete,
}: ConceptCompleteButtonProps) {
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  // Get completion status from curriculum data
  const { data: curriculum } = useQuery({
    queryKey: ["user-curriculum", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/courses/${courseId}/curriculum`)
      return response.data
    },
  })

  const isCompleted = curriculum?.find(
    (entry: any) => entry.concept.id === conceptId
  )?.isCompleted

  const handleClick = async () => {
    try {
      setIsUpdating(true)
      const response = await axios.post(`/api/concepts/${conceptId}/toggle-complete`)
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["user-curriculum", courseId],
      })
      await queryClient.invalidateQueries({
        queryKey: ["next-concept", courseId],
      })

      // Show appropriate toast
      if (response.data.completed) {
        toast.success("Concept marked as complete")
      } else {
        toast.success("Concept marked as incomplete")
      }

      // Call onComplete with the new state
      onComplete?.(response.data.completed)
    } catch (error) {
      toast.error("Failed to update completion status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Button
      variant={isCompleted ? "outline" : "default"}
      onClick={handleClick}
      disabled={isUpdating}
      className="min-w-[140px]"
    >
      {isCompleted ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Completed
        </>
      ) : (
        "Mark Complete"
      )}
    </Button>
  )
}
