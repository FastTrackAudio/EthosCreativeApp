type ContentBlockType = "video" | "audio" | "text" | "image"

interface BaseContentBlock {
  id: string
  type: ContentBlockType
  order: number
}

interface VideoBlock extends BaseContentBlock {
  type: "video"
  content: {
    url: string
    title?: string
  }
}

interface AudioBlock extends BaseContentBlock {
  type: "audio"
  content: {
    url: string
    title?: string
  }
}

interface ImageBlock extends BaseContentBlock {
  type: "image"
  content: {
    url: string
    title?: string
    size?: {
      width: string
      height: string
    }
  }
}

interface TextBlock extends BaseContentBlock {
  type: "text"
  content: {
    blocks: any[] // BlockNote content
    isTransparent?: boolean
  }
}

type ContentBlock = VideoBlock | AudioBlock | ImageBlock | TextBlock

interface ConceptContent {
  version: "1"
  blocks: ContentBlock[]
}
