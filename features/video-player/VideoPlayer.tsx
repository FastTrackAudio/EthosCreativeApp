"use client";

import React, { forwardRef } from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
});

interface CustomVideoPlayerProps {
  url: string;
  thumbnailUrl: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export const CustomVideoPlayer = forwardRef<
  HTMLDivElement,
  CustomVideoPlayerProps
>(({ url, thumbnailUrl, title, autoPlay = false, muted = false, controls = true }, ref) => {
  return (
    <div
      ref={ref}
      className="relative aspect-video w-full ~max-w-[300px]/[1200px] mx-auto"
    >
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        playing={autoPlay}
        muted={muted}
        controls={controls}
        title={title}
      />
    </div>
  );
});

CustomVideoPlayer.displayName = "CustomVideoPlayer";
