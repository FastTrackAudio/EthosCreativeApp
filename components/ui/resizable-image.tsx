"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResizableImageProps {
  src: string
  alt: string
  initialWidth?: string | number
  initialHeight?: string | number
  className?: string
  onResize?: (width: number, height: number) => void
}

export function ResizableImage({
  src,
  alt,
  initialWidth = "100%",
  initialHeight = "auto",
  className,
  onResize,
}: ResizableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(initialWidth)
  const [height, setHeight] = useState(initialHeight)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  const getMaxWidth = () =>
    containerRef.current?.parentElement?.offsetWidth || 0

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return

    const delta = e.clientX - startX
    const maxWidth = getMaxWidth()
    const newWidth = Math.min(maxWidth, Math.max(200, startWidth + delta * 2))
    setWidth(newWidth)
    onResize?.(newWidth, height === "auto" ? 0 : Number(height))
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleResize(e)
    const handleMouseUp = () => setIsResizing(false)

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ew-resize"
    } else {
      document.body.style.cursor = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
    }
  }, [isResizing, startX, startWidth])

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(containerRef.current?.offsetWidth || 0)
  }

  return (
    <div className="flex justify-center w-full">
      <div
        ref={containerRef}
        className={cn(
          "group relative inline-block",
          typeof width === "number"
            ? "w-[length:var(--image-width)]"
            : "w-full",
          className
        )}
        style={
          {
            "--image-width": typeof width === "number" ? `${width}px` : width,
          } as any
        }
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="max-w-full h-auto object-contain rounded-lg"
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: "auto",
          }}
        />

        {/* Resize overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Left resize handle */}
          <div
            className="absolute inset-y-0 left-0 w-4 cursor-ew-resize flex items-center justify-start px-1"
            onMouseDown={startResizing}
          >
            <div className="w-1 h-8 bg-primary/50 rounded-full" />
          </div>

          {/* Right resize handle */}
          <div
            className="absolute inset-y-0 right-0 w-4 cursor-ew-resize flex items-center justify-end px-1"
            onMouseDown={startResizing}
          >
            <div className="w-1 h-8 bg-primary/50 rounded-full" />
          </div>

          {/* Resize indicators */}
          {isResizing && (
            <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-xs text-center text-primary bg-background/80 py-1">
                {Math.round(typeof width === "number" ? width : getMaxWidth())}
                px
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
