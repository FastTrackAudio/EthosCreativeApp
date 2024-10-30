"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Import VideoPlayer dynamically
const CustomVideoPlayer = dynamic(
  () => import("@/features/video-player/VideoPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-muted animate-pulse rounded-lg" />
    ),
  }
)

const SAMPLE_URLS = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Vimeo",
    url: "https://vimeo.com/148751763",
  },
  {
    name: "Direct MP4",
    url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4",
  },
]

export default function VideoPlayerTestPage() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_URLS[0].url)
  const [inputUrl, setInputUrl] = useState("")

  const handleUpdateUrl = () => {
    if (inputUrl.trim()) {
      setVideoUrl(inputUrl.trim())
      setInputUrl("")
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Video Player Testing</h1>

      <div className="max-w-3xl mx-auto space-y-8">
        <CustomVideoPlayer
          src={videoUrl}
          title="Test Video"
          description="This is a test video to demonstrate the video player functionality."
          thumbnail="https://example.com/thumbnail.jpg"
        />

        <Card>
          <CardHeader>
            <CardTitle>Change Video URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="videoUrl" className="sr-only">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  placeholder="Enter video URL..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateUrl()
                    }
                  }}
                />
              </div>
              <Button onClick={handleUpdateUrl} disabled={!inputUrl.trim()}>
                Update
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Sample URLs</Label>
              <div className="grid gap-2">
                {SAMPLE_URLS.map((sample) => (
                  <Button
                    key={sample.name}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3"
                    onClick={() => setVideoUrl(sample.url)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{sample.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[500px]">
                        {sample.url}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p>Current URL: {videoUrl}</p>
        </div>
      </div>
    </div>
  )
}
