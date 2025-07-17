import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SyncTube Remote - เล่นเพลงร่วมกันแบบเรียลไทม์",
  description: "สร้างห้องเพลงและให้เพื่อนเพิ่มเพลงเข้าคิวได้จากมือถือแบบเรียลไทม์",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
