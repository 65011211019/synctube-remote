"use client"

import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConnectionStatusProps {
  isConnected: boolean
  className?: string
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">เชื่อมต่อแล้ว</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">ไม่ได้เชื่อมต่อ</span>
        </>
      )}
    </div>
  )
}

interface ConnectionAlertProps {
  isConnected: boolean
  onRetry?: () => void
}

export function ConnectionAlert({ isConnected, onRetry }: ConnectionAlertProps) {
  if (isConnected) return null

  return (
    <Alert className="mb-4 bg-yellow-500/20 border-yellow-500/50 text-yellow-100">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>การเชื่อมต่อแบบเรียลไทม์ขาดหาย กำลังพยายามเชื่อมต่อใหม่...</span>
        {onRetry && (
          <button onClick={onRetry} className="text-yellow-200 hover:text-yellow-100 underline ml-4">
            ลองใหม่
          </button>
        )}
      </AlertDescription>
    </Alert>
  )
}
