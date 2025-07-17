"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, QrCode, Copy, Trash2, Wifi, WifiOff } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRoomSync, type Room } from "@/hooks/use-room-sync"
import { YouTubePlayer } from "@/components/youtube-player"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function HostRoom() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [showQR, setShowQR] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<any>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0)

  const { room, isConnected, isLoading, updateRoom } = useRoomSync({
    roomId,
    isHost: true,
    onRoomUpdate: (updatedRoom) => {
      console.log("Room updated:", updatedRoom)
      setCurrentPlaybackTime(updatedRoom.currentTime || 0) // Update local state
      syncPlayerWithRoom(updatedRoom)
    },
    onError: (errorMessage) => {
      setError(errorMessage)
    },
  })

  // Load YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      // Load YouTube API script
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        tag.async = true
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      // Set up the callback
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    const initializePlayer = () => {
      setIsPlayerReady(true) // Assume player will be ready via YouTubePlayer component
    }

    loadYouTubeAPI()

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        // playerRef.current.destroy()
      }
    }
  }, [])

  // Sync player with room state
  const syncPlayerWithRoom = (roomData: Room) => {
    // This function is now primarily for reacting to room updates from Supabase
    // and ensuring the YouTubePlayer component receives the correct props.
    // The actual player control logic is mostly within YouTubePlayer.
    // We just need to ensure the YouTubePlayer component gets the latest room data.
    // The YouTubePlayer component will handle loading, playing, pausing, and seeking based on its props.
  }

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      playNext()
    }
  }

  const playPause = async () => {
    if (!room || !isPlayerReady || !playerRef.current) {
      console.log("Cannot play/pause:", { room: !!room, isPlayerReady, player: !!playerRef.current })
      return
    }

    try {
      const newIsPlaying = !room.isPlaying

      // Add a check to play the first song in queue if no current song and trying to play:
      if (newIsPlaying && !room.currentSong && room.queue.length > 0) {
        await playNext() // This will set currentSong and isPlaying to true
        return
      }

      await updateRoom({
        ...room,
        isPlaying: newIsPlaying,
      })
    } catch (error) {
      console.error("Error toggling play/pause:", error)
      setError("ไม่สามารถควบคุมการเล่นได้")
    }
  }

  const playNext = async () => {
    console.log("playNext called!")
    if (!room || room.queue.length === 0) {
      console.log("Cannot play next: no room or empty queue")
      return
    }

    try {
      const nextSong = room.queue[0]
      const newQueue = room.queue.slice(1)

      console.log("Playing next song:", nextSong.title)

      // Update room state first
      await updateRoom({
        ...room,
        currentSong: nextSong,
        queue: newQueue,
        isPlaying: true,
      })

      // Then update player
      // if (isPlayerReady && playerRef.current) {
      //   playerRef.current.loadVideoById(nextSong.videoId)
      //   // Auto-play after loading
      //   setTimeout(() => {
      //     if (playerRef.current) {
      //       playerRef.current.playVideo()
      //     }
      //   }, 1000)
      // }
      if (room && room.currentSong && room.queue.length === 0) {
        await updateRoom({
          ...room,
          currentSong: undefined,
          isPlaying: false,
          currentTime: 0,
        })
      }
    } catch (error) {
      console.error("Error playing next song:", error)
      setError("ไม่สามารถเล่นเพลงถัดไปได้")
    }
  }

  const removeSong = async (songId: string) => {
    if (!room) return

    try {
      const newQueue = room.queue.filter((song) => song.id !== songId)
      await updateRoom({
        ...room,
        queue: newQueue,
      })
    } catch (error) {
      console.error("Error removing song:", error)
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
  }

  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${roomId}` : ""

  const handleSeek = async (time: number) => {
    if (!room) return
    try {
      await updateRoom({
        ...room,
        currentSong: room.currentSong,
        currentTime: time, // Update the room's overall current time
      })
    } catch (error) {
      console.error("Error seeking song:", error)
      setError("ไม่สามารถเลื่อนเพลงได้")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <Alert className="max-w-md bg-destructive/20 border-destructive/50 text-destructive-foreground">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">ไม่พบห้อง</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Host Room</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Room ID: {roomId}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{room.participants} คน</span>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-sm ${isConnected ? "text-green-400" : "text-destructive"}`}>
                  {isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyRoomId}
              variant="outline"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-border"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy ID
            </Button>
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border-border"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <Card className="mb-8 bg-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle className="text-primary-foreground text-center">QR Code สำหรับเข้าร่วมห้อง</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={roomUrl} size={200} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* YouTube Player */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-md border-border mb-6">
              <CardHeader>
                <CardTitle className="text-primary-foreground">
                  {room.currentSong ? room.currentSong.title : "ไม่มีเพลงที่กำลังเล่น"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <YouTubePlayer
                  currentSong={room.currentSong}
                  isPlaying={room.isPlaying}
                  onPlayPause={playPause}
                  onNext={playNext}
                  onEnded={playNext}
                  onSeek={handleSeek} // Pass the new handler
                  hasNextSong={room.queue.length > 0}
                  initialTime={currentPlaybackTime} // Pass initial time
                />
              </CardContent>
            </Card>
          </div>

          {/* Queue */}
          <div>
            <Card className="bg-card/50 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-primary-foreground">คิวเพลง ({room.queue.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {room.queue.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      ยังไม่มีเพลงในคิว
                      <br />
                      ให้เพื่อนเพิ่มเพลงผ่านมือถือ
                    </p>
                  ) : (
                    room.queue.map((song, index) => (
                      <div key={song.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <div className="text-accent font-mono text-sm w-6">{index + 1}</div>
                        <img
                          src={song.thumbnail || "/placeholder.svg"}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-primary-foreground text-sm font-medium truncate">{song.title}</p>
                          <p className="text-muted-foreground text-xs">โดย {song.addedBy}</p>
                        </div>
                        <Button
                          onClick={() => removeSong(song.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
