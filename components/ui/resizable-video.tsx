"use client"

import { useState, useEffect } from "react"
import { CustomVideoPlayer } from "@/features/video-player/VideoPlayer"
import { Resizable, ResizeDirection } from "re-resizable"

interface ResizableVideoProps {
  src: string
  title?: string
  initialWidth?: string
  initialHeight?: string
  onResize?: (width: number, height: number) => void
}

export function ResizableVideo({
  src,
  title,
  initialWidth = "100%",
  initialHeight = "auto",
  onResize,
}: ResizableVideoProps) {
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  })

  useEffect(() => {
    setSize({
      width: initialWidth,
      height: initialHeight,
    })
  }, [initialWidth, initialHeight])

  return (
    <Resizable
      size={{
        width: size.width,
        height: size.height,
      }}
      onResizeStop={(
        e: MouseEvent | TouchEvent,
        direction: ResizeDirection,
        ref: HTMLElement,
        d: { width: number; height: number }
      ) => {
        const newWidth = ref.style.width
        const newHeight = ref.style.height
        setSize({
          width: newWidth,
          height: newHeight,
        })
        if (onResize) {
          onResize(parseInt(newWidth), parseInt(newHeight))
        }
      }}
      className="relative"
    >
      <div className="w-full h-full">
        <CustomVideoPlayer src={src} title={title} />
      </div>
    </Resizable>
  )
}
