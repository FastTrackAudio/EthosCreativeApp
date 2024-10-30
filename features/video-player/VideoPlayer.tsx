"use client"

import React, { useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"

// Fix the dynamic import with forwardRef
const ReactPlayer = dynamic(
  () =>
    import("react-player").then((mod) => {
      const { default: Player } = mod
      return Player
    }),
  { ssr: false }
)

interface CustomVideoPlayerProps {
  src?: string
  title?: string
  description?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  width?: string | number
  height?: string | number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (error: unknown) => void
}

export function CustomVideoPlayer({
  src = "",
  title,
  description,
  autoPlay = false,
  muted: initialMuted = false,
  loop = false,
  controls = true,
  width = "100%",
  height = "100%",
  onPlay,
  onPause,
  onEnded,
  onError,
}: CustomVideoPlayerProps) {
  const isYouTube = src?.includes("youtube.com") || src?.includes("youtu.be")

  // If it's a YouTube video, render with native controls
  if (isYouTube) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <ReactPlayer
            url={src}
            width={width}
            height={height}
            playing={autoPlay}
            muted={initialMuted}
            loop={loop}
            controls={true}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  playsinline: 1,
                },
              },
            }}
          />
        </div>
        {(title || description) && (
          <div className="space-y-2">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // For non-YouTube videos, use our custom controls
  const [playing, setPlaying] = useState(autoPlay)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(initialMuted)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [seeking, setSeeking] = useState(false)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (playing) {
          setShowControls(false)
        }
      }, 2000)
    }

    const container = playerContainerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
      }
      clearTimeout(timeout)
    }
  }, [playing])

  const handlePlayPause = () => {
    setPlaying(!playing)
    if (playing) {
      onPause?.()
    } else {
      onPlay?.()
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setMuted(value[0] === 0)
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer()
      if (player?.setVolume) {
        player.setVolume(value[0] * 100)
      }
    }
  }

  const handleToggleMute = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer()
      const newMuted = !muted
      setMuted(newMuted)
      if (player?.mute && player?.unMute) {
        if (newMuted) {
          player.mute()
        } else {
          player.unMute()
        }
      }
    }
  }

  const handleSeekChange = (value: number[]) => {
    if (!playerRef.current) return
    setSeeking(true)
    const newTime = value[0]
    setPlayed(newTime)

    const duration = playerRef.current.getDuration()
    const seekTime = duration * newTime
    playerRef.current.seekTo(seekTime, "seconds")
    setSeeking(false)
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      const duration = playerRef.current?.getDuration() || 0
      setPlayed(state.playedSeconds / duration)
    }
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"

    const date = new Date(seconds * 1000)
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    return `${mm}:${ss}`
  }

  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        playerContainerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={playerContainerRef}
        className="relative group bg-[var(--color-surface)] rounded-lg overflow-hidden"
      >
        <ReactPlayer
          ref={playerRef}
          url={src}
          width={width}
          height={height}
          playing={playing}
          volume={volume}
          muted={muted}
          loop={loop}
          onProgress={handleProgress}
          onDuration={setDuration}
          onEnded={onEnded}
          onError={onError}
          style={{ aspectRatio: "16/9" }}
        />

        {controls && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--color-surface-elevated)] via-[var(--color-surface-elevated)]/50 to-transparent p-4 transition-opacity duration-300",
              {
                "opacity-0": !showControls && playing,
                "opacity-100": showControls || !playing,
              }
            )}
          >
            <Slider
              defaultValue={[0]}
              value={[played]}
              max={1}
              step={0.001}
              onValueChange={handleSeekChange}
              className="mb-4 [&_.relative]:bg-[var(--color-border)] [&_[role=slider]]:bg-[var(--color-text)]"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--color-text)] hover:text-[var(--color-text)]/80"
                  onClick={handlePlayPause}
                >
                  {playing ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[var(--color-text)] hover:text-[var(--color-text)]/80"
                    onClick={handleToggleMute}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </Button>

                  <Slider
                    defaultValue={[0.5]}
                    value={[muted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-32"
                  />
                </div>

                <span className="text-sm text-[var(--color-text)] min-w-[100px]">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--color-text)] hover:text-[var(--color-text)]/80"
                onClick={handleFullscreen}
              >
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomVideoPlayer
