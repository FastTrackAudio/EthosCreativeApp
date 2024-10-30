"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/mock-db"
import { ConceptCard } from "@/types/kanban"
import { toast } from "sonner"

export function useCards() {
  const queryClient = useQueryClient()

  const { data: cards, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const data = await db.card.findMany()
      return data.sort((a, b) => a.order - b.order)
    },
  })

  const createCard = useMutation({
    mutationFn: async (newCard: Partial<ConceptCard>) => {
      return await db.card.create({ data: newCard })
    },
    onMutate: async (newCard) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cards"] })

      // Snapshot the previous value
      const previousCards = queryClient.getQueryData<ConceptCard[]>(["cards"])

      // Optimistically update to the new value
      if (previousCards) {
        queryClient.setQueryData<ConceptCard[]>(
          ["cards"],
          [
            ...previousCards,
            {
              id: `temp-${Date.now()}`,
              title: newCard.title!,
              description: newCard.description,
              imageUrl: newCard.imageUrl,
              order: newCard.order!,
              sectionId: newCard.sectionId!,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]
        )
      }

      // Return a context object with the snapshotted value
      return { previousCards }
    },
    onError: (err, newCard, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(["cards"], context.previousCards)
      }
      toast.error("Failed to create card")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] })
      toast.success("Card created successfully")
    },
  })

  const updateCard = useMutation({
    mutationFn: async (card: Partial<ConceptCard>) => {
      return await db.card.update({
        where: { id: card.id! },
        data: card,
      })
    },
    onMutate: async (updatedCard) => {
      await queryClient.cancelQueries({ queryKey: ["cards"] })

      const previousCards = queryClient.getQueryData<ConceptCard[]>(["cards"])

      if (previousCards) {
        queryClient.setQueryData<ConceptCard[]>(
          ["cards"],
          previousCards.map((card) =>
            card.id === updatedCard.id ? { ...card, ...updatedCard } : card
          )
        )
      }

      return { previousCards }
    },
    onError: (err, updatedCard, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(["cards"], context.previousCards)
      }
      toast.error("Failed to update card")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] })
      toast.success("Card updated successfully")
    },
  })

  const deleteCard = useMutation({
    mutationFn: async (id: string) => {
      return await db.card.delete({
        where: { id },
      })
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["cards"] })

      const previousCards = queryClient.getQueryData<ConceptCard[]>(["cards"])

      if (previousCards) {
        queryClient.setQueryData<ConceptCard[]>(
          ["cards"],
          previousCards.filter((card) => card.id !== deletedId)
        )
      }

      return { previousCards }
    },
    onError: (err, deletedId, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(["cards"], context.previousCards)
      }
      toast.error("Failed to delete card")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] })
      toast.success("Card deleted successfully")
    },
  })

  return {
    cards,
    isLoading,
    createCard,
    updateCard,
    deleteCard,
  }
}
