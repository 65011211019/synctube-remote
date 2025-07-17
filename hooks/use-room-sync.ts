"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface Song {
  id: string
  title: string
  videoId: string
  thumbnail: string
  duration: string
  addedBy: string
  addedAt: string
}

export interface Room {
  id: string
  hostId: string
  currentSong?: Song
  isPlaying: boolean
  queue: Song[]
  participants: number
  updatedAt: string
  currentTime: number
}

interface UseRoomSyncOptions {
  roomId: string
  isHost?: boolean
  onRoomUpdate?: (room: Room) => void
  onError?: (error: string) => void
}

export function useRoomSync({ roomId, isHost = false, onRoomUpdate, onError }: UseRoomSyncOptions) {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Initialize room
  const initializeRoom = async (hostId?: string) => {
    try {
      if (isHost && hostId) {
        // Create or update room as host
        const { data, error } = await supabase
          .from("rooms")
          .upsert({
            id: roomId,
            host_id: hostId,
            current_song: null,
            is_playing: false,
            queue: [],
            participants: 1,
            current_time: 0,
          })
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Join existing room as participant
        const { data, error } = await supabase.from("rooms").select("*").eq("id", roomId).single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error("Error initializing room:", error)
      onError?.("ไม่สามารถเข้าถึงห้องได้")
      return null
    }
  }

  // Update room data
  const updateRoom = async (updates: Partial<Room>) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          current_song: updates.currentSong || null,
          is_playing: updates.isPlaying ?? false,
          queue: updates.queue || [],
          participants: updates.participants || 0,
          updated_at: new Date().toISOString(),
          current_time: updates.currentTime ?? 0,
        })
        .eq("id", roomId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating room:", error)
      onError?.("ไม่สามารถอัปเดตห้องได้")
    }
  }

  // Add participant
  const addParticipant = async (userName: string) => {
    try {
      // Add to participants table
      await supabase.from("participants").insert({
        room_id: roomId,
        user_name: userName,
        is_active: true,
      })

      // Update participant count
      const { data: roomData } = await supabase.from("rooms").select("participants").eq("id", roomId).single()

      if (roomData) {
        await supabase
          .from("rooms")
          .update({ participants: (roomData.participants || 0) + 1 })
          .eq("id", roomId)
      }
    } catch (error) {
      console.error("Error adding participant:", error)
    }
  }

  // Remove participant
  const removeParticipant = async (userName: string) => {
    try {
      // Mark as inactive
      await supabase.from("participants").update({ is_active: false }).eq("room_id", roomId).eq("user_name", userName)

      // Update participant count
      const { data: roomData } = await supabase.from("rooms").select("participants").eq("id", roomId).single()

      if (roomData && roomData.participants > 0) {
        await supabase
          .from("rooms")
          .update({ participants: roomData.participants - 1 })
          .eq("id", roomId)
      }
    } catch (error) {
      console.error("Error removing participant:", error)
    }
  }

  // Setup real-time subscription
  useEffect(() => {
    let mounted = true

    const setupRealtime = async () => {
      try {
        // ใช้ hostId เดิมจาก localStorage ถ้ามี
        let hostId: string | undefined = undefined
        if (isHost) {
          hostId = localStorage.getItem(`hostId-${roomId}`) || undefined
          if (!hostId) {
            hostId = `host-${Date.now()}`
            localStorage.setItem(`hostId-${roomId}`, hostId)
          }
        }
        const roomData = await initializeRoom(hostId)

        if (!mounted || !roomData) return

        // --- FIX START: Cast the initial data to a known shape ---
        // Cast the object from Supabase to access its properties safely.
        const d = roomData as { [key: string]: any }
        if (typeof d !== "object" || !d.id) return

        const initialRoom: Room = {
          id: d.id,
          hostId: d.host_id,
          currentSong: d.current_song,
          isPlaying: d.is_playing,
          queue: d.queue || [],
          participants: d.participants || 0,
          updatedAt: d.updated_at,
          currentTime: d.current_time || 0,
        }
        // --- FIX END ---

        setRoom(initialRoom)
        onRoomUpdate?.(initialRoom)

        // Setup real-time channel
        const channel = supabase
          .channel(`room-${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "rooms",
              filter: `id=eq.${roomId}`,
            },
            (payload) => {
              console.log("Real-time update:", payload)

              if (payload.new && mounted) {
                // --- FIX START: Cast the real-time update data to a known shape ---
                // payload.new is of type `{[key: string]: any}`, so we cast it to access its properties.
                const newRoomData = payload.new as { [key: string]: any }
                const updatedRoom: Room = {
                  id: newRoomData.id,
                  hostId: newRoomData.host_id,
                  currentSong: newRoomData.current_song,
                  isPlaying: newRoomData.is_playing,
                  queue: newRoomData.queue || [],
                  participants: newRoomData.participants || 0,
                  updatedAt: newRoomData.updated_at,
                  currentTime: newRoomData.current_time || 0,
                }
                // --- FIX END ---

                setRoom(updatedRoom)
                onRoomUpdate?.(updatedRoom)
              }
            },
          )
          .subscribe((status) => {
            console.log("Subscription status:", status)
            setIsConnected(status === "SUBSCRIBED")
          })

        channelRef.current = channel
      } catch (error) {
        console.error("Error setting up realtime:", error)
        onError?.("ไม่สามารถเชื่อมต่อแบบเรียลไทม์ได้")
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    setupRealtime()

    return () => {
      mounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [roomId, isHost])

  return {
    room,
    isConnected,
    isLoading,
    updateRoom,
    addParticipant,
    removeParticipant,
  }
}