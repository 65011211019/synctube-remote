import { NextResponse } from "next/server"
import { env, validateEnv } from "@/lib/env"

export async function GET() {
  try {
    // Validate environment variables
    validateEnv()

    // Check YouTube API
    const youtubeStatus = env.YOUTUBE_API_KEY ? "configured" : "missing"

    // Check Supabase
    const supabaseStatus = env.SUPABASE_URL && env.SUPABASE_ANON_KEY ? "configured" : "missing"

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        youtube: youtubeStatus,
        supabase: supabaseStatus,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
