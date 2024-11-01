"use client"

import { Resizable } from "re-resizable"
import Image from "next/image"

interface ResizableImageProps {
  src: string
  alt: string
  initialWidth?: string | number
  initialHeight?: string | number
  onResize?: (width: number, height: number) => void
  editable?: boolean
}

export function ResizableImage({
  src,
  alt,
  initialWidth = "100%",
  initialHeight = "300px",
  onResize,
  editable = false,
}: ResizableImageProps) {
  if (!editable) {
    return (
      <div
        style={{
          width: initialWidth,
          height: initialHeight,
          position: "relative",
          minHeight: "200px",
        }}
        className="rounded-lg overflow-hidden"
      >
        <Image src={src} alt={alt} fill className="object-contain" />
      </div>
    )
  }

  return (
    <Resizable
      defaultSize={{
        width: initialWidth,
        height: initialHeight,
      }}
      minHeight={200}
      onResizeStop={(e, direction, ref, d) => {
        const newWidth = ref.style.width
        const newHeight = ref.style.height
        onResize?.(
          parseInt(newWidth),
          newHeight === "auto" ? 0 : parseInt(newHeight)
        )
      }}
      className="relative rounded-lg overflow-hidden"
    >
      <Image src={src} alt={alt} fill className="object-contain" />
    </Resizable>
  )
}
