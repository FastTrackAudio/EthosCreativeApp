"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";

interface ResizableImageProps {
  src: string;
  alt: string;
  initialWidth?: string;
  initialHeight?: string;
  editable?: boolean;
  onResize?: (width: number, height: number) => void;
}

export function ResizableImage({
  src,
  alt,
  initialWidth = "100%",
  initialHeight = "auto",
  editable = false,
  onResize,
}: ResizableImageProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
  }, [initialWidth, initialHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable) return;
    
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = imageRef.current?.offsetWidth || 0;
    startHeightRef.current = imageRef.current?.offsetHeight || 0;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      const newWidth = Math.max(100, startWidthRef.current + deltaX);
      const aspectRatio = imageRef.current?.naturalWidth / (imageRef.current?.naturalHeight || 1);
      const newHeight = Math.round(newWidth / aspectRatio);

      setWidth(`${newWidth}px`);
      setHeight(`${newHeight}px`);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        const numericWidth = parseInt(width.toString());
        const numericHeight = parseInt(height.toString());
        if (!isNaN(numericWidth) && !isNaN(numericHeight)) {
          onResize?.(numericWidth, numericHeight);
        }
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, width, height, onResize]);

  return (
    <div className="w-full flex justify-center">
      <div
        className={cn(
          "relative inline-block group",
          isResizing && "select-none"
        )}
        style={{ width, height }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
        />
        {editable && (
          <div
            className={cn(
              "absolute bottom-2 right-2 p-1.5",
              "bg-background/80 backdrop-blur-sm rounded-sm",
              "cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity",
              "border shadow-sm"
            )}
            onMouseDown={handleMouseDown}
          >
            <GripHorizontal className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
