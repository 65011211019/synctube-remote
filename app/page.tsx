"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Users, Smartphone, Monitor } from "lucide-react"
import { EnvChecker } from "@/components/env-checker"

export default function HomePage() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/host/${newRoomId}`)
  }

  const joinRoom = () => {
    if (roomId.trim()) {
      router.push(`/join/${roomId.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Environment Checker */}
        <EnvChecker />

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-red-300" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">SyncTube Remote</h1>
          </div>
          <p className="text-xl text-red-200 max-w-2xl mx-auto">สร้างห้องเพลงและให้เพื่อนเพิ่มเพลงเข้าคิวได้แบบเรียลไทม์</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room Card */}
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader className="text-center">
              <Monitor className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <CardTitle className="text-2xl text-primary-foreground">สร้างห้องใหม่</CardTitle>
              <CardDescription className="text-muted-foreground">เป็น Host และควบคุมการเล่นเพลง</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  ควบคุม YouTube Player
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  รับ Room ID และ QR Code
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  จัดการคิวเพลง
                </div>
              </div>
              <Button onClick={createRoom} className="w-full bg-primary hover:bg-primary/90" size="lg">
                สร้างห้องเล่นเพลง
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader className="text-center">
              <Smartphone className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <CardTitle className="text-2xl text-primary-foreground">เข้าร่วมห้อง</CardTitle>
              <CardDescription className="text-muted-foreground">เพิ่มเพลงเข้าคิวจากมือถือ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  ค้นหาเพลง YouTube
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  เพิ่มเพลงเข้าคิว
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  โหวตข้ามเพลง
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="กรอก Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                />
                <Button
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                >
                  เข้าร่วมห้อง
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-8">ฟีเจอร์หลัก</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-6 border border-border">
              <Users className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">เรียลไทม์</h3>
              <p className="text-muted-foreground text-sm">ทุกคนเห็นคิวเพลงเดียวกันแบบเรียลไทม์</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-6 border border-border">
              <Music className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">YouTube Integration</h3>
              <p className="text-muted-foreground text-sm">ค้นหาและเล่นเพลงจาก YouTube โดยตรง</p>
            </div>
            <div className="bg-card/50 backdrop-blur-md rounded-lg p-6 border border-border">
              <Smartphone className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">Mobile Friendly</h3>
              <p className="text-muted-foreground text-sm">ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
