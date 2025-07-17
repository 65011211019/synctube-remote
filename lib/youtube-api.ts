// YouTube Data API utility functions

import { env } from "@/lib/env"

export interface YouTubeSearchResult {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
  description: string
  publishedAt: string
}

export interface YouTubeApiResponse {
  items: Array<{
    id: {
      videoId: string
    }
    snippet: {
      title: string
      description: string
      thumbnails: {
        medium: {
          url: string
        }
      }
      channelTitle: string
      publishedAt: string
    }
  }>
}

export interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string
    contentDetails: {
      duration: string
    }
  }>
}

// Convert ISO 8601 duration to readable format (PT4M13S -> 4:13)
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return "0:00"

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Search YouTube videos
export async function searchYouTubeVideos(query: string, maxResults = 10): Promise<YouTubeSearchResult[]> {
  const API_KEYS = [env.YOUTUBE_API_KEY, env.YOUTUBE_API_KEY2].filter(Boolean)
  const MAX_ATTEMPTS = 5 * API_KEYS.length
  let lastError: any = null

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const API_KEY = API_KEYS[i % API_KEYS.length]
    try {
      // Step 1: Search for videos
      const searchUrl =
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `maxResults=${maxResults}&` +
        `key=${API_KEY}`

      const searchResponse = await fetch(searchUrl)

      if (!searchResponse.ok) {
        if (searchResponse.status === 403) {
          lastError = new Error("YouTube API quota exceeded or invalid API key")
          continue // ลอง key ถัดไป
        }
        throw new Error(`YouTube API error: ${searchResponse.status}`)
      }

      const searchData: YouTubeApiResponse = await searchResponse.json()

      if (!searchData.items || searchData.items.length === 0) {
        return []
      }

      // Step 2: Get video durations
      const videoIds = searchData.items.map((item) => item.id.videoId).join(",")
      const detailsUrl =
        `https://www.googleapis.com/youtube/v3/videos?` + `part=contentDetails&` + `id=${videoIds}&` + `key=${API_KEY}`

      const detailsResponse = await fetch(detailsUrl)
      if (!detailsResponse.ok) {
        if (detailsResponse.status === 403) {
          lastError = new Error("YouTube API quota exceeded or invalid API key")
          continue // ลอง key ถัดไป
        }
        throw new Error(`YouTube API error: ${detailsResponse.status}`)
      }
      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json()

      // Step 3: Combine search results with durations
      const results: YouTubeSearchResult[] = searchData.items.map((item, index) => {
        const duration = detailsData.items[index]?.contentDetails.duration || "PT0S"

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          duration: parseDuration(duration),
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
        }
      })

      return results
    } catch (error) {
      lastError = error
    }
  }
  // ถ้า quota หมดทุก key ทุกรอบ
  console.error("YouTube API error:", lastError)
  throw lastError || new Error("YouTube API error")
}

// Get video details by ID
export async function getYouTubeVideoDetails(videoId: string): Promise<YouTubeSearchResult | null> {
  const API_KEYS = [env.YOUTUBE_API_KEY, env.YOUTUBE_API_KEY2].filter(Boolean)
  const MAX_ATTEMPTS = 5 * API_KEYS.length
  let lastError: any = null

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const API_KEY = API_KEYS[i % API_KEYS.length]
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails&` +
        `id=${videoId}&` +
        `key=${API_KEY}`

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 403) {
          lastError = new Error("YouTube API quota exceeded or invalid API key")
          continue // ลอง key ถัดไป
        }
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        return null
      }

      const item = data.items[0]

      return {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: parseDuration(item.contentDetails.duration),
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
      }
    } catch (error) {
      lastError = error
    }
  }
  // ถ้า quota หมดทุก key ทุกรอบ
  console.error("YouTube API error:", lastError)
  throw lastError || new Error("YouTube API error")
}

// Validate YouTube URL and extract video ID
export function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
