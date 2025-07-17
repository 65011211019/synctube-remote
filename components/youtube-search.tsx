"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import {
  searchYouTubeVideos,
  extractVideoIdFromUrl,
  getYouTubeVideoDetails,
  type YouTubeSearchResult,
} from "@/lib/youtube-api"

interface YouTubeSearchProps {
  onAddToQueue: (song: YouTubeSearchResult) => void
  className?: string
}

export function YouTubeSearch({ onAddToQueue, className }: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // Check if input is a YouTube URL
      const videoId = extractVideoIdFromUrl(searchQuery.trim())

      if (videoId) {
        // If it's a URL, get video details directly
        const videoDetails = await getYouTubeVideoDetails(videoId)
        if (videoDetails) {
          setSearchResults([videoDetails])
        } else {
          setError("ไม่พบวิดีโอนี้ หรือวิดีโอไม่สามารถเข้าถึงได้")
        }
      } else {
        // If it's a search query, search YouTube
        const results = await searchYouTubeVideos(searchQuery.trim(), 8)
        setSearchResults(results)

        if (results.length === 0) {
          setError("ไม่พบผลลัพธ์สำหรับคำค้นหานี้")
        }
      }
    } catch (error) {
      console.error("Search error:", error)

      if (error instanceof Error) {
        if (error.message.includes("quota exceeded")) {
          setError("YouTube API quota หมดแล้ว กรุณาลองใหม่ในภายหลัง")
        } else if (error.message.includes("not configured")) {
          setError("YouTube API key ยังไม่ได้ตั้งค่า")
        } else {
          setError("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง")
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ")
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToQueue = (song: YouTubeSearchResult) => {
    onAddToQueue(song)
    // Clear search results after adding
    setSearchResults([])
    setSearchQuery("")
    setError(null)
  }

  const formatDuration = (duration: string) => {
    return duration || "N/A"
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <Input
          placeholder="ค้นหาเพลง YouTube หรือใส่ลิงก์..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          onKeyPress={(e) => e.key === "Enter" && !isSearching && searchYouTube()}
          disabled={isSearching}
        />
        <Button
          onClick={searchYouTube}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-primary hover:bg-primary/90 min-w-[44px]"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {searchResults.map((song) => (
          <div
            key={song.id}
            className="flex items-start gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img
                src={song.thumbnail || "/placeholder.svg?height=90&width=120"}
                alt={song.title}
                className="w-20 h-15 rounded object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                {formatDuration(song.duration)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-primary-foreground text-sm font-medium leading-tight mb-1">
                {truncateText(song.title, 60)}
              </h3>
              <p className="text-muted-foreground text-xs mb-1">{song.channelTitle}</p>
              {song.description && (
                <p className="text-muted-foreground text-xs leading-tight">{truncateText(song.description, 100)}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  onClick={() => handleAddToQueue(song)}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-7"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  เพิ่ม
                </Button>
                <Button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${song.id}`, "_blank")}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary text-xs h-7"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent mr-2" />
          <span className="text-muted-foreground">กำลังค้นหา...</span>
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && searchQuery && !error && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">ไม่พบผลลัพธ์</p>
        </div>
      )}

      {/* Instructions */}
      {!searchQuery && (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">💡 คุณสามารถค้นหาด้วยชื่อเพลง หรือใส่ลิงก์ YouTube โดยตรง</p>
        </div>
      )}
    </div>
  )
}
