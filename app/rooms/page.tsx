'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Room {
  id: string
  host_id: string
  participants: number
  created_at: string
  updated_at: string
  password?: string // mock field for demo
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || [])
        setLoading(false)
      })
      .catch((err) => {
        setError("เกิดข้อผิดพลาดในการโหลดห้องออนไลน์")
        setLoading(false)
      })
  }, [])

  // mock: สมมุติห้องที่ id ลงท้ายด้วย 9 ต้องใช้รหัส "1234"
  const roomNeedsPassword = (room: Room) => room.id.endsWith("9")

  const handleJoin = (room: Room) => {
    if (roomNeedsPassword(room)) {
      setSelectedRoom(room)
      setShowPasswordModal(true)
      setPasswordInput("")
      setPasswordError("")
    } else {
      router.push(`/join/${room.id}`)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!selectedRoom) return
    setSubmitting(true)
    setPasswordError("")
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setShowPasswordModal(false)
        router.push(`/join/${selectedRoom.id}`)
      } else {
        setPasswordError(data.error || "รหัสผ่านไม่ถูกต้อง")
      }
    } catch (e) {
      setPasswordError("เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">ห้องออนไลน์</h1>
      {loading && <div>กำลังโหลด...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && rooms.length === 0 && <div>ยังไม่มีห้องออนไลน์</div>}
      <div className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between bg-card rounded-lg p-4 shadow">
            <div>
              <div className="font-semibold">ห้อง: {room.id}</div>
              <div className="text-sm text-muted-foreground">Host: {room.host_id}</div>
              <div className="text-sm text-muted-foreground">คนในห้อง: {room.participants}</div>
            </div>
            <Button onClick={() => handleJoin(room)}>
              เข้าห้อง
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>กรอกรหัสผ่านเพื่อเข้าห้อง</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="รหัสผ่าน"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handlePasswordSubmit() }}
            autoFocus
            disabled={submitting}
          />
          {passwordError && <div className="text-red-500 text-sm mt-1">{passwordError}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} disabled={submitting}>ยกเลิก</Button>
            <Button onClick={handlePasswordSubmit} disabled={submitting}>เข้าห้อง</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 