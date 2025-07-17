import { type NextRequest, NextResponse } from "next/server"
import { getYouTubeVideoDetails } from "@/lib/youtube-api"

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  const { videoId } = params

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  try {
    const videoDetails = await getYouTubeVideoDetails(videoId)

    if (!videoDetails) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({ video: videoDetails })
  } catch (error) {
    console.error("YouTube video API error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("quota") ? 429 : 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
