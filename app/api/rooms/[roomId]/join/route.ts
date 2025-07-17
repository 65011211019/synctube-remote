import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const { password } = await req.json()
  const { roomId } = params

  // mock: ห้องที่ id ลงท้ายด้วย 9 ต้องใช้รหัส 1234
  if (roomId.endsWith("9")) {
    if (password !== "1234") {
      return NextResponse.json({ success: false, error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 })
    }
  }
  // ถ้าห้องไม่มีรหัสหรือรหัสถูกต้อง
  return NextResponse.json({ success: true })
} 