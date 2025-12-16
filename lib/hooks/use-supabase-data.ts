"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export interface Dog {
  id: string
  name: string
  breed: string
  birthDate: string
  gender: string
  weight: string
  photo: string
  owner_id: string
}

export interface DiaryEntry {
  id: string
  dogId: string
  dogName: string
  type: string
  title: string
  notes: string
  date: string
  time: string
  owner_id: string
}

export interface CalendarEvent {
  id: string
  dog_id: string
  title: string
  description: string
  date: string
  time: string
  type: string
  repeat: string
  notify_before: number
}

export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setDogs([])
      setLoading(false)
      return
    }

    loadDogs()

    // Real-time subscription
    const channel = supabase
      .channel("dogs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "dogs", filter: `owner_id=eq.${user.id}` }, () => {
        loadDogs()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadDogs() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedDogs: Dog[] =
        data?.map((dog) => ({
          id: dog.id,
          name: dog.name,
          breed: dog.breed,
          birthDate: dog.birth_date,
          gender: dog.gender || "Macho",
          weight: dog.weight || "0",
          photo: dog.photo || "/placeholder.svg?height=200&width=200",
          owner_id: dog.owner_id,
        })) || []

      setDogs(formattedDogs)
    } catch (error) {
      console.error("[v0] Error loading dogs:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addDog(dog: Omit<Dog, "id" | "owner_id">) {
    if (!user) return

    try {
      const dogData: any = {
        owner_id: user.id,
        name: dog.name,
        breed: dog.breed,
        birth_date: dog.birthDate,
        photo: dog.photo || "/placeholder.svg?height=200&width=200",
      }

      // Add optional fields only if they exist in schema (after migration)
      if (dog.gender) dogData.gender = dog.gender
      if (dog.weight) dogData.weight = dog.weight

      const { data, error } = await supabase.from("dogs").insert([dogData]).select()

      if (error) {
        console.error("[v0] Supabase error details:", error)
        throw error
      }

      console.log("[v0] Dog successfully added to Supabase:", data)
      await loadDogs()
      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding dog:", error)
      throw error
    }
  }

  async function updateDog(id: string, updates: Partial<Dog>) {
    if (!user) return

    try {
      const { error } = await supabase
        .from("dogs")
        .update({
          name: updates.name,
          breed: updates.breed,
          birth_date: updates.birthDate,
          gender: updates.gender,
          weight: updates.weight,
          photo: updates.photo,
        })
        .eq("id", id)
        .eq("owner_id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error updating dog:", error)
      throw error
    }
  }

  async function deleteDog(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("dogs").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error deleting dog:", error)
      throw error
    }
  }

  return { dogs, loading, addDog, updateDog, deleteDog, refetch: loadDogs, refreshDogs: loadDogs }
}

export function useDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    loadEntries()

    const channel = supabase
      .channel("diary_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diary_entries", filter: `owner_id=eq.${user.id}` },
        () => {
          loadEntries()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadEntries() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("owner_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false })

      if (error) throw error

      const formattedEntries: DiaryEntry[] =
        data?.map((entry) => ({
          id: entry.id,
          dogId: entry.dog_id,
          dogName: entry.dog_name,
          type: entry.type,
          title: entry.title,
          notes: entry.notes || "",
          date: entry.date,
          time: entry.time,
          owner_id: entry.owner_id,
        })) || []

      setEntries(formattedEntries)
    } catch (error) {
      console.error("[v0] Error loading diary entries:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addEntry(entry: Omit<DiaryEntry, "id" | "owner_id">) {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .insert([
          {
            owner_id: user.id,
            dog_id: entry.dogId,
            dog_name: entry.dogName,
            type: entry.type,
            title: entry.title,
            notes: entry.notes,
            date: entry.date,
            time: entry.time,
          },
        ])
        .select()

      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding diary entry:", error)
      throw error
    }
  }

  async function deleteEntry(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error deleting diary entry:", error)
      throw error
    }
  }

  return { entries, loading, addEntry, deleteEntry, refreshEntries: loadEntries }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }

    loadEvents()

    const channel = supabase
      .channel("calendar_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_events" }, () => {
        loadEvents()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadEvents() {
    if (!user) return

    try {
      // Get user's dogs first
      const { data: dogsData } = await supabase.from("dogs").select("id").eq("owner_id", user.id)

      if (!dogsData || dogsData.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      const dogIds = dogsData.map((dog) => dog.id)

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .in("dog_id", dogIds)
        .order("date", { ascending: true })

      if (error) throw error

      const formattedEvents: CalendarEvent[] =
        data?.map((event) => ({
          id: event.id,
          dog_id: event.dog_id,
          title: event.title,
          description: event.description || "",
          date: event.date,
          time: event.time,
          type: event.type,
          repeat: event.repeat || "Não repetir",
          notify_before: event.notify_before || 0,
        })) || []

      setEvents(formattedEvents)
    } catch (error) {
      console.error("[v0] Error loading calendar events:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addEvent(event: Omit<CalendarEvent, "id">) {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert([
          {
            dog_id: event.dog_id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            type: event.type,
            repeat: event.repeat,
            notify_before: event.notify_before,
          },
        ])
        .select()

      if (error) {
        console.error("[v0] Supabase error details:", error)
        throw error
      }

      console.log("[v0] Calendar event successfully added to Supabase:", data)
      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding calendar event:", error)
      throw error
    }
  }

  async function deleteEvent(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error deleting calendar event:", error)
      throw error
    }
  }

  return { events, loading, addEvent, deleteEvent, refreshEvents: loadEvents }
}
