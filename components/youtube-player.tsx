"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Song {
  id: string
  title: string
  videoId: string
  thumbnail: string
  duration: string
  addedBy: string
  addedAt: string
}

interface YouTubePlayerProps {
  currentSong?: Song
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onEnded: () => void
  onSeek: (time: number) => void // New prop for seeking
  hasNextSong: boolean
  className?: string
  initialTime?: number // New prop for initial playback time
}

// Fix global augmentation

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Utility function to format time (e.g., 125 seconds -> 2:05)
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function YouTubePlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onEnded,
  onSeek,
  hasNextSong,
  className,
  initialTime = 0,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        tag.async = true
        document.head.appendChild(tag)
      }
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    const initializePlayer = () => {
      if (!containerRef.current) return
      const playerId = `youtube-player-${Date.now()}`
      containerRef.current.innerHTML = `<div id="${playerId}"></div>`
      playerRef.current = new window.YT.Player(playerId, {
        height: "100%",
        width: "100%",
        videoId: currentSong?.videoId || "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          fs: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log("YouTube player ready")
            setIsPlayerReady(true)
            setPlayerError(null)
            setCurrentTime(0) // reset currentTime when player is ready for new song
            event.target.setVolume(volume)
            if (isMuted) event.target.mute()
            if (currentSong)
              event.target.loadVideoById(currentSong.videoId, initialTime)
          },
          onStateChange: (event: any) => {
            console.log("Player state changed:", event.data)
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded()
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              if (intervalRef.current) clearInterval(intervalRef.current)
              intervalRef.current = setInterval(() => {
                if (playerRef.current && !isSeeking)
                  setCurrentTime(playerRef.current.getCurrentTime())
                setDuration(playerRef.current.getDuration())
              }, 1000)
            } else {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data)
            const errorMessages = {
              2: "วิดีโอ ID ไม่ถูกต้อง",
              5: "เกิดข้อผิดพลาดใน HTML5 player",
              100: "ไม่พบวิดีโอนี้",
              101: "เจ้าของวิดีโอไม่อนุญาตให้เล่นในเว็บไซต์นี้",
              150: "เจ้าของวิดีโอไม่อนุญาตให้เล่นในเว็บไซต์นี้",
            }
            setPlayerError(errorMessages[event.data as keyof typeof errorMessages] || "เกิดข้อผิดพลาดในการเล่นวิดีโอ")
          },
        },
      })
    }

    loadYouTubeAPI()

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy()
        } catch (error) {
          console.error("Error destroying player:", error)
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !currentSong?.videoId) return
    setCurrentTime(0) // reset currentTime when song changes
    const currentVideoId = playerRef.current.getVideoData()?.video_id
    if (currentVideoId !== currentSong.videoId) {
      console.log("Loading video:", currentSong.title, "at time: 0")
      playerRef.current.loadVideoById(currentSong.videoId, 0)
    } else {
      if (Math.abs(playerRef.current.getCurrentTime() - 0) > 2) {
        console.log("Seeking to initial time: 0")
        playerRef.current.seekTo(0, true)
      }
    }
  }, [currentSong?.videoId, isPlayerReady])

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !currentSong) return
    const currentState = playerRef.current.getPlayerState()
    if (isPlaying && currentState !== window.YT.PlayerState.PLAYING) {
      console.log("Starting playback")
      playerRef.current.playVideo()
    } else {
      if (!isPlaying && currentState === window.YT.PlayerState.PLAYING) {
        console.log("Pausing playback")
        playerRef.current.pauseVideo()
      }
    }
  }, [isPlaying, isPlayerReady, currentSong])

  // Auto-next after 5 seconds when song ends
  useEffect(() => {
    if (
      isPlayerReady &&
      hasNextSong &&
      currentSong &&
      duration > 0 &&
      Math.abs(currentTime - duration) < 0.5 // allow for float rounding
    ) {
      const timer = setTimeout(() => {
        onNext()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [currentTime, duration, isPlayerReady, hasNextSong, currentSong, onNext])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute()
        setVolume(playerRef.current.getVolume())
      } else {
        playerRef.current.mute()
        setVolume(0)
      }
      setIsMuted(!isMuted)
    }
  }

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value)
    setCurrentTime(newTime)
    setIsSeeking(true)
  }, [])

  const handleSeekEnd = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const newTime = Number((e.target as HTMLInputElement).value)
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true)
      onSeek(newTime)
    }
    setIsSeeking(false)
  }, [onSeek])

  return (
    <div className={className}>
      {/* Video Container */}
      <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">กำลังโหลด YouTube Player...</div>
          </div>
        )}
        {!currentSong && isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="text-xl mb-2">🎵</div>
              <div>ไม่มีเพลงที่กำลังเล่น</div>
              <div className="text-sm text-gray-300">รอให้เพื่อนเพิ่มเพลงเข้าคิว</div>
            </div>
          </div>
        )}
      </div>
      {/* Error Alert */}
      {playerError && (
        <Alert className="mb-4 bg-destructive/20 border-destructive/50 text-destructive-foreground">
          <AlertDescription>{playerError}</AlertDescription>
        </Alert>
      )}
      {/* Custom Controls */}
      <div className="flex flex-col gap-3">
        {/* Seek Bar */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={() => {}}
            step="1"
            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--secondary)) ${(currentTime / duration) * 100}%, hsl(var(--secondary)) 100%)`,
            }}
            disabled={!isPlayerReady || !currentSong}
          />
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onPlayPause}
              disabled={!isPlayerReady || !currentSong}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              onClick={onNext}
              disabled={!hasNextSong}
              variant="outline"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-border"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button onClick={toggleMute} variant="ghost" size="sm" className="text-foreground hover:bg-secondary">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume}%, hsl(var(--secondary)) ${volume}%, hsl(var(--secondary)) 100%)`,
              }}
              disabled={!isPlayerReady}
            />
          </div>
        </div>
      </div>
      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div>Player Ready: {isPlayerReady ? "✅" : "❌"}</div>
          <div>Current Song: {currentSong ? `✅ ${currentSong.title}` : "❌"}</div>
          <div>Is Playing: {isPlaying ? "✅" : "❌"}</div>
          <div>Has Next: {hasNextSong ? "✅" : "❌"}</div>
          <div>Current Time: {formatTime(currentTime)}</div>
          <div>Duration: {formatTime(duration)}</div>
        </div>
      )}
    </div>
  )
}
