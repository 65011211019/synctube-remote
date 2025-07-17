// Environment variables validation and types

export const env = {
  // YouTube API
  YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // App
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV,
} as const

// Validation function
export function validateEnv() {
  const required = ["NEXT_PUBLIC_YOUTUBE_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file and make sure all required variables are set.",
    )
  }
}

// Type-safe environment variables
export type Env = typeof env
