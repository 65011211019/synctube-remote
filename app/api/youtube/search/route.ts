import { type NextRequest, NextResponse } from "next/server"
import { searchYouTubeVideos } from "@/lib/youtube-api"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const maxResults = Number.parseInt(searchParams.get("maxResults") || "10")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const results = await searchYouTubeVideos(query, maxResults)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("YouTube search API error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes("quota") ? 429 : 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
