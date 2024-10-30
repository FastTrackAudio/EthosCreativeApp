import { ConceptCard, Section } from "@/types/kanban"

// Mock data store
let sections: Section[] = [
  {
    id: "1",
    title: "To Learn",
    order: 0,
    sortBy: "custom",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "In Progress",
    order: 1,
    sortBy: "custom",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Completed",
    order: 2,
    sortBy: "custom",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let cards: ConceptCard[] = [
  {
    id: "1",
    title: "React Fundamentals",
    description:
      "Learn the basics of React including components, props, and state",
    imageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    order: 0,
    sectionId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "State Management",
    description: "Explore different state management solutions",
    imageUrl:
      "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&auto=format&fit=crop&q=60",
    order: 1,
    sectionId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "TypeScript Basics",
    description: "Getting started with TypeScript in React applications",
    order: 0,
    sectionId: "2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock database operations
export const db = {
  section: {
    findMany: async () => [...sections],
    create: async (data: { data: Partial<Section> }) => {
      const newSection = {
        id: String(sections.length + 1),
        title: data.data.title!,
        order: data.data.order!,
        sortBy: "custom",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      sections.push(newSection)
      return newSection
    },
    update: async (query: {
      where: { id: string }
      data: Partial<Section>
    }) => {
      const index = sections.findIndex((s) => s.id === query.where.id)
      if (index === -1) throw new Error("Section not found")
      sections[index] = {
        ...sections[index],
        ...query.data,
        updatedAt: new Date().toISOString(),
      }
      return sections[index]
    },
    delete: async (query: { where: { id: string } }) => {
      const index = sections.findIndex((s) => s.id === query.where.id)
      if (index === -1) throw new Error("Section not found")
      sections = sections.filter((s) => s.id !== query.where.id)
      // Also delete all cards in this section
      cards = cards.filter((c) => c.sectionId !== query.where.id)
      return sections[index]
    },
  },
  card: {
    findMany: async () => [...cards],
    create: async (data: { data: Partial<ConceptCard> }) => {
      const newCard = {
        id: String(cards.length + 1),
        title: data.data.title!,
        description: data.data.description,
        imageUrl: data.data.imageUrl,
        order: data.data.order!,
        sectionId: data.data.sectionId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      cards.push(newCard)
      return newCard
    },
    update: async (query: {
      where: { id: string }
      data: Partial<ConceptCard>
    }) => {
      const index = cards.findIndex((c) => c.id === query.where.id)
      if (index === -1) throw new Error("Card not found")
      cards[index] = {
        ...cards[index],
        ...query.data,
        updatedAt: new Date().toISOString(),
      }
      return cards[index]
    },
    delete: async (query: { where: { id: string } }) => {
      const index = cards.findIndex((c) => c.id === query.where.id)
      if (index === -1) throw new Error("Card not found")
      cards = cards.filter((c) => c.id !== query.where.id)
      return cards[index]
    },
  },
}
