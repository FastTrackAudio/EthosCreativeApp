"use client"

import React, { useState, useRef, useEffect } from "react"
import ReactPlayer from "react-player"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Maximize, Minimize, Play, Pause } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomVideoPlayerProps {
  url?: string
  title?: string
  thumbnail?: string
  uiHideTimeout?: number
}

export default function CustomVideoPlayer({
  url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  title = "Big Buck Bunny",
  thumbnail = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
  uiHideTimeout = 3000,
}: CustomVideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(true)
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(
    null
  )
  const [showUI, setShowUI] = useState(true)

  const playerRef = useRef<ReactPlayer>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setPlaying(!playing)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [playing])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingVolume && volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newVolume = Math.max(0, Math.min(1, x / rect.width))
        handleVolumeChange(newVolume)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingVolume(false)
    }

    if (isDraggingVolume) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingVolume])

  useEffect(() => {
    if (!thumbnail && !generatedThumbnail) {
      generateThumbnail()
    }
  }, [thumbnail, generatedThumbnail])

  const generateThumbnail = () => {
    const video = document.createElement("video")
    video.src = url
    video.crossOrigin = "anonymous"
    video.addEventListener("loadeddata", () => {
      video.currentTime = 1 // Set to 1 second to avoid black frame
    })
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas
        .getContext("2d")
        ?.drawImage(video, 0, 0, canvas.width, canvas.height)
      setGeneratedThumbnail(canvas.toDataURL())
    })
  }

  const handlePlayPause = () => {
    setPlaying(!playing)
    setShowThumbnail(false)
    showUITemporarily()
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setMuted(newVolume === 0)
    showUITemporarily()
  }

  const handleToggleMute = () => {
    setMuted(!muted)
    showUITemporarily()
  }

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0])
    playerRef.current?.seekTo(value[0])
    showUITemporarily()
  }

  const handleProgress = (state: { played: number }) => {
    if (!playerRef.current?.seeking) {
      setPlayed(state.played)
    }
  }

  const handleDuration = (duration: number) => setDuration(duration)

  const handlePlaybackRateChange = (value: string) => {
    setPlaybackRate(parseFloat(value))
    showUITemporarily()
  }

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
    showUITemporarily()
  }

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDraggingVolume(true)
    const rect = volumeBarRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const newVolume = Math.max(0, Math.min(1, x / rect.width))
      handleVolumeChange(newVolume)
    }
  }

  const showUITemporarily = () => {
    setShowUI(true)
    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current)
    }
    uiTimeoutRef.current = setTimeout(() => {
      setShowUI(false)
    }, uiHideTimeout)
  }

  const handleMouseMove = () => {
    showUITemporarily()
  }

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`
    }
    return `${mm}:${ss}`
  }

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowUI(false)}
    >
      {showThumbnail && (thumbnail || generatedThumbnail) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={thumbnail || generatedThumbnail || ""}
            alt={title}
            layout="fill"
            objectFit="cover"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            aria-label="Play"
            className="text-white hover:text-white bg-black/50 rounded-full p-8"
          >
            <Play className="h-12 w-12" />
          </Button>
        </div>
      )}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={muted ? 0 : volume}
        muted={muted}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        progressInterval={100}
      />
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4"
          >
            <Slider
              value={[played]}
              min={0}
              max={0.999999}
              step={0.000001}
              onValueChange={handleSeekChange}
              className="w-full mb-4 [&>.bg-primary]:bg-white [&>.bg-muted]:bg-black [&_[role=slider]]:bg-white"
            />
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPause}
                  aria-label={playing ? "Pause" : "Play"}
                  className="text-white hover:text-white"
                >
                  {playing ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="text-white hover:text-white"
                >
                  {muted ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </Button>
                <div
                  ref={volumeBarRef}
                  className="relative w-24 h-1 bg-black rounded-full overflow-hidden cursor-pointer"
                  onMouseDown={handleVolumeMouseDown}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full"
                    style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                  />
                </div>
                <span className="text-sm">
                  {formatTime(duration * played)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Select
                  onValueChange={handlePlaybackRateChange}
                  value={playbackRate.toString()}
                >
                  <SelectTrigger className="w-[100px] bg-transparent text-white border-white">
                    <SelectValue placeholder="Speed" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFullscreenToggle}
                  aria-label={
                    fullscreen ? "Exit fullscreen" : "Enter fullscreen"
                  }
                  className="text-white hover:text-white"
                >
                  {fullscreen ? (
                    <Minimize className="h-6 w-6" />
                  ) : (
                    <Maximize className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-4 left-4 right-4 text-white">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
    </div>
  )
}
