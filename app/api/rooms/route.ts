import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase-client"
import { env } from "@/lib/env"

// สร้าง supabase client
const supabase = createClient<Database>(env.SUPABASE_URL as string, env.SUPABASE_ANON_KEY as string)

export async function GET() {
  // ลบห้องที่ไม่มีคิวและ updated_at เกิน 30 นาที
  const THIRTY_MIN_AGO = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  await supabase
    .from("rooms")
    .delete()
    .match({ queue: [] })
    .lt("updated_at", THIRTY_MIN_AGO)

  // ดึงห้องที่มีผู้เข้าร่วมหรือทั้งหมด (ตัวอย่างนี้ดึงทั้งหมด)
  const { data, error } = await supabase
    .from("rooms")
    .select("id, host_id, participants, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rooms: data })
} 