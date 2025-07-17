"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface HealthStatus {
  status: string
  services: {
    youtube: string
    supabase: string
  }
}

export function EnvChecker() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setHealth(data)
        } else {
          setError(data.message)
        }
      })
      .catch((err) => {
        setError("ไม่สามารถตรวจสอบการตั้งค่าได้")
      })
  }, [])

  if (error) {
    return (
      <Alert className="mb-4 bg-red-500/20 border-red-500/50 text-red-100">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>การตั้งค่าไม่ถูกต้อง:</strong> {error}
          <br />
          <small>กรุณาตรวจสอบไฟล์ .env.local</small>
        </AlertDescription>
      </Alert>
    )
  }

  if (!health) {
    return null
  }

  const hasIssues = health.services.youtube === "missing" || health.services.supabase === "missing"

  if (!hasIssues) {
    return null // Don't show anything if everything is OK
  }

  return (
    <Alert className="mb-4 bg-yellow-500/20 border-yellow-500/50 text-yellow-100">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>การตั้งค่าไม่สมบูรณ์:</strong>
        <ul className="mt-2 space-y-1">
          {health.services.youtube === "missing" && <li>• YouTube API Key ยังไม่ได้ตั้งค่า</li>}
          {health.services.supabase === "missing" && <li>• Supabase ยังไม่ได้ตั้งค่า</li>}
        </ul>
        <small className="block mt-2">ดูวิธีตั้งค่าใน SETUP.md</small>
      </AlertDescription>
    </Alert>
  )
}
