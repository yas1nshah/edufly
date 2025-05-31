"use client"

import { Card, CardContent } from "@/components/ui/card"
import { get } from "http"
import { Play } from "lucide-react"

interface YouTubeEmbedProps {
  videoId: string
  title: string
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  return (
    <Card className="my-6 p-0">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${getVideoId(videoId)}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-destructive" />
            <span className="font-medium">{title}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const getVideoId = (input: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  const match = input.match(regex);
  return match ? match[1] : input;
};
