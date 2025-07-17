"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Music, Trash2, ThumbsUp, Wifi, WifiOff } from "lucide-react"
import { YouTubeSearch } from "@/components/youtube-search"
import { useRoomSync, type Song } from "@/hooks/use-room-sync"
import type { YouTubeSearchResult } from "@/lib/youtube-api"

export default function JoinRoom() {
  const params = useParams()
  const roomId = params.roomId as string
  const [userName, setUserName] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { room, isConnected, isLoading, updateRoom, addParticipant, removeParticipant } = useRoomSync({
    roomId,
    isHost: false,
    onRoomUpdate: (updatedRoom) => {
      console.log("Room updated:", updatedRoom)
    },
    onError: (errorMessage) => {
      setError(errorMessage)
    },
  })

  useEffect(() => {
    // Generate random username
    const names = ["🎵 Music Lover", "🎸 Rocker", "🎤 Singer", "🎹 Pianist", "🥁 Drummer"]
    setUserName(names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 1000))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isJoined && userName) {
        removeParticipant(userName)
      }
    }
  }, [isJoined, userName, removeParticipant])

  const joinRoom = async () => {
    if (!room) {
      setError("ไม่พบห้องนี้")
      return
    }

    try {
      await addParticipant(userName)
      setIsJoined(true)
    } catch (error) {
      console.error("Error joining room:", error)
      setError("เกิดข้อผิดพลาดในการเข้าร่วมห้อง")
    }
  }

  const addToQueue = async (song: YouTubeSearchResult) => {
    if (!room) return

    const newSong: Song = {
      id: Date.now().toString(),
      title: song.title,
      videoId: song.id,
      thumbnail: song.thumbnail,
      duration: song.duration,
      addedBy: userName,
      addedAt: new Date().toISOString(),
    }

    try {
      const updatedQueue = [...room.queue, newSong]
      await updateRoom({
        ...room,
        queue: updatedQueue,
      })
    } catch (error) {
      console.error("Error adding song:", error)
      setError("ไม่สามารถเพิ่มเพลงได้")
    }
  }

  const removeMySong = async (songId: string) => {
    if (!room) return

    const song = room.queue.find((s) => s.id === songId)
    if (song?.addedBy !== userName) return

    try {
      const updatedQueue = room.queue.filter((s) => s.id !== songId)
      await updateRoom({
        ...room,
        queue: updatedQueue,
      })
    } catch (error) {
      console.error("Error removing song:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <Alert className="max-w-md bg-destructive/20 border-destructive/50 text-destructive-foreground">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="text-center">
            <Music className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <CardTitle className="text-2xl text-primary-foreground">เข้าร่วมห้อง</CardTitle>
            <p className="text-muted-foreground">Room ID: {roomId}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-primary-foreground text-sm mb-2 block">ชื่อของคุณ</label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                placeholder="กรอกชื่อ"
              />
            </div>
            {error && (
              <Alert className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={joinRoom}
              disabled={!userName.trim()}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="lg"
            >
              เข้าร่วมห้อง
            </Button>
          </CardContent>
        </Card>
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
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">🎵 {userName}</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                Room: {roomId}
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
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <Card className="bg-card/50 backdrop-blur-md border-border mb-6">
            <CardHeader>
              <CardTitle className="text-primary-foreground">ค้นหาเพลง YouTube</CardTitle>
            </CardHeader>
            <CardContent>
              <YouTubeSearch onAddToQueue={addToQueue} />
            </CardContent>
          </Card>

          {/* Current Song & Queue */}
          <div>
            {/* Now Playing */}
            {room.currentSong && (
              <Card className="bg-card/50 backdrop-blur-md border-border mb-6">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">🎵 กำลังเล่น</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <img
                      src={room.currentSong.thumbnail || "/placeholder.svg"}
                      alt={room.currentSong.title}
                      className="w-16 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-primary-foreground font-medium truncate">{room.currentSong.title}</p>
                      <p className="text-muted-foreground text-sm">โดย {room.currentSong.addedBy}</p>
                    </div>
                    <div className="text-green-400">{room.isPlaying ? "▶️" : "⏸️"}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Queue */}
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
                      ค้นหาและเพิ่มเพลงเข้าคิว
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
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-accent hover:text-accent/80 hover:bg-accent/20"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          {song.addedBy === userName && (
                            <Button
                              onClick={() => removeMySong(song.id)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
