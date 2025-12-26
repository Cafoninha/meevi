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

export interface FeedingRecord {
  id: string
  dog_id: string
  food_brand: string
  meal_time: string
  portion_size?: string
  notes?: string
  owner_id: string
}

export interface BathRecord {
  id: string
  dog_id: string
  bath_time: string
  notes?: string
  owner_id: string
}

export interface ExerciseRecord {
  id: string
  dog_id: string
  exercise_type: string
  duration: string
  exercise_time: string
  notes?: string
  owner_id: string
}

export interface VaccineRecord {
  id: string
  dog_id: string
  vaccine_name: string
  date: string
  next_date?: string
  status: string
  notes?: string
  owner_id: string
}

export interface Notification {
  id: string
  owner_id: string
  dog_id?: string
  type: string
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
  scheduled_for?: string
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
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.breed !== undefined) updateData.breed = updates.breed
      if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate
      if (updates.gender !== undefined) updateData.gender = updates.gender
      if (updates.weight !== undefined) updateData.weight = updates.weight
      if (updates.photo !== undefined) updateData.photo = updates.photo

      const { error } = await supabase.from("dogs").update(updateData).eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      console.log("[v0] Dog updated successfully, reloading list instantly...")
      await loadDogs()
    } catch (error) {
      console.error("[v0] Error updating dog:", error)
      throw error
    }
  }

  async function deleteDog(id: string) {
    if (!user) return

    try {
      console.log("[v0] Attempting to delete dog with id:", id)

      const { error } = await supabase.from("dogs").delete().eq("id", id).eq("owner_id", user.id)

      if (error) {
        console.error("[v0] Supabase delete error:", error)
        throw error
      }

      console.log("[v0] Dog deleted successfully, reloading list...")
      await loadDogs()
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

export function useFeeding() {
  const [records, setRecords] = useState<FeedingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setRecords([])
      setLoading(false)
      return
    }

    loadRecords()

    const channel = supabase
      .channel("feeding_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feeding_records", filter: `owner_id=eq.${user.id}` },
        () => {
          console.log("[v0] Feeding records changed, reloading...")
          loadRecords()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadRecords() {
    if (!user) return

    try {
      console.log("[v0] Loading feeding records...")
      const { data, error } = await supabase
        .from("feeding_records")
        .select("*")
        .eq("owner_id", user.id)
        .order("meal_time", { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedRecords: FeedingRecord[] =
        data?.map((record) => ({
          id: record.id,
          dog_id: record.dog_id,
          food_brand: record.food_brand,
          meal_time: record.meal_time,
          portion_size: record.portion_size,
          notes: record.notes,
          owner_id: record.owner_id,
        })) || []

      console.log("[v0] Loaded feeding records:", formattedRecords.length)
      setRecords(formattedRecords)
    } catch (error) {
      console.error("[v0] Error loading feeding records:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addRecord(record: Omit<FeedingRecord, "id" | "owner_id">) {
    if (!user) return

    try {
      console.log("[v0] Adding feeding record...")
      const { data, error } = await supabase
        .from("feeding_records")
        .insert([
          {
            owner_id: user.id,
            dog_id: record.dog_id,
            food_brand: record.food_brand,
            meal_time: record.meal_time,
            portion_size: record.portion_size,
            notes: record.notes,
          },
        ])
        .select()

      if (error) throw error

      console.log("[v0] Feeding record added successfully:", data)

      await loadRecords()

      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding feeding record:", error)
      throw error
    }
  }

  async function deleteRecord(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("feeding_records").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      await loadRecords()
    } catch (error) {
      console.error("[v0] Error deleting feeding record:", error)
      throw error
    }
  }

  return { records, loading, addRecord, deleteRecord, refreshRecords: loadRecords }
}

export function useBath() {
  const [records, setRecords] = useState<BathRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setRecords([])
      setLoading(false)
      return
    }

    loadRecords()

    const channel = supabase
      .channel("bath_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bath_records", filter: `owner_id=eq.${user.id}` },
        () => {
          console.log("[v0] Bath records changed, reloading...")
          loadRecords()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadRecords() {
    if (!user) return

    try {
      console.log("[v0] Loading bath records...")
      const { data, error } = await supabase
        .from("bath_records")
        .select("*")
        .eq("owner_id", user.id)
        .order("bath_time", { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedRecords: BathRecord[] =
        data?.map((record) => ({
          id: record.id,
          dog_id: record.dog_id,
          bath_time: record.bath_time,
          notes: record.notes,
          owner_id: record.owner_id,
        })) || []

      console.log("[v0] Loaded bath records:", formattedRecords.length)
      setRecords(formattedRecords)
    } catch (error) {
      console.error("[v0] Error loading bath records:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addRecord(record: Omit<BathRecord, "id" | "owner_id">) {
    if (!user) return

    try {
      console.log("[v0] Adding bath record...")
      const { data, error } = await supabase
        .from("bath_records")
        .insert([
          {
            owner_id: user.id,
            dog_id: record.dog_id,
            bath_time: record.bath_time,
            notes: record.notes,
          },
        ])
        .select()

      if (error) throw error

      console.log("[v0] Bath record added successfully:", data)

      await loadRecords()

      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding bath record:", error)
      throw error
    }
  }

  async function deleteRecord(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("bath_records").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      await loadRecords()
    } catch (error) {
      console.error("[v0] Error deleting bath record:", error)
      throw error
    }
  }

  return { records, loading, addRecord, deleteRecord, refreshRecords: loadRecords }
}

export function useExercise() {
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setRecords([])
      setLoading(false)
      return
    }

    loadRecords()

    const channel = supabase
      .channel("exercise_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exercise_records", filter: `owner_id=eq.${user.id}` },
        () => {
          console.log("[v0] Exercise records changed, reloading...")
          loadRecords()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadRecords() {
    if (!user) return

    try {
      console.log("[v0] Loading exercise records...")
      const { data, error } = await supabase
        .from("exercise_records")
        .select("*")
        .eq("owner_id", user.id)
        .order("exercise_time", { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedRecords: ExerciseRecord[] =
        data?.map((record) => ({
          id: record.id,
          dog_id: record.dog_id,
          exercise_type: record.exercise_type,
          duration: record.duration,
          exercise_time: record.exercise_time,
          notes: record.notes,
          owner_id: record.owner_id,
        })) || []

      console.log("[v0] Loaded exercise records:", formattedRecords.length)
      setRecords(formattedRecords)
    } catch (error) {
      console.error("[v0] Error loading exercise records:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addRecord(record: Omit<ExerciseRecord, "id" | "owner_id">) {
    if (!user) return

    try {
      console.log("[v0] Adding exercise record...")
      const { data, error } = await supabase
        .from("exercise_records")
        .insert([
          {
            owner_id: user.id,
            dog_id: record.dog_id,
            exercise_type: record.exercise_type,
            duration: record.duration,
            exercise_time: record.exercise_time,
            notes: record.notes,
          },
        ])
        .select()

      if (error) throw error

      console.log("[v0] Exercise record added successfully:", data)

      await loadRecords()

      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding exercise record:", error)
      throw error
    }
  }

  async function deleteRecord(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("exercise_records").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      await loadRecords()
    } catch (error) {
      console.error("[v0] Error deleting exercise record:", error)
      throw error
    }
  }

  return { records, loading, addRecord, deleteRecord, refreshRecords: loadRecords }
}

export function useVaccines() {
  const [records, setRecords] = useState<VaccineRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setRecords([])
      setLoading(false)
      return
    }

    loadRecords()

    const channel = supabase
      .channel("vaccine_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vaccine_status", filter: `owner_id=eq.${user.id}` },
        () => {
          console.log("[v0] Vaccine records changed, reloading...")
          loadRecords()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadRecords() {
    if (!user) return

    try {
      console.log("[v0] Loading vaccine records...")
      const { data, error } = await supabase
        .from("vaccine_status")
        .select("*")
        .eq("owner_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error

      const formattedRecords: VaccineRecord[] =
        data?.map((record) => ({
          id: record.id,
          dog_id: record.dog_id,
          vaccine_name: record.vaccine_name,
          date: record.date,
          next_date: record.next_date,
          status: record.status,
          notes: record.notes,
          owner_id: record.owner_id,
        })) || []

      console.log("[v0] Loaded vaccine records:", formattedRecords.length)
      setRecords(formattedRecords)
    } catch (error) {
      console.error("[v0] Error loading vaccine records:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addRecord(record: Omit<VaccineRecord, "id" | "owner_id">) {
    if (!user) return

    try {
      console.log("[v0] Adding vaccine record...")
      const { data, error } = await supabase
        .from("vaccine_status")
        .insert([
          {
            owner_id: user.id,
            dog_id: record.dog_id,
            vaccine_name: record.vaccine_name,
            date: record.date,
            next_date: record.next_date,
            status: record.status,
            notes: record.notes,
          },
        ])
        .select()

      if (error) throw error

      console.log("[v0] Vaccine record added successfully:", data)

      await loadRecords()

      return data?.[0]
    } catch (error) {
      console.error("[v0] Error adding vaccine record:", error)
      throw error
    }
  }

  async function deleteRecord(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("vaccine_status").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      await loadRecords()
    } catch (error) {
      console.error("[v0] Error deleting vaccine record:", error)
      throw error
    }
  }

  return { records, loading, addRecord, deleteRecord, refreshRecords: loadRecords }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    loadNotifications()

    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `owner_id=eq.${user.id}` },
        () => {
          console.log("[v0] Notifications changed, reloading...")
          loadNotifications()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  async function loadNotifications() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("owner_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedNotifications: Notification[] =
        data?.map((n) => ({
          id: n.id,
          owner_id: n.owner_id,
          dog_id: n.dog_id,
          type: n.type,
          title: n.title,
          message: n.message,
          is_read: n.is_read,
          action_url: n.action_url,
          created_at: n.created_at,
          scheduled_for: n.scheduled_for,
        })) || []

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.length)
    } catch (error) {
      console.error("[v0] Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("owner_id", user.id)

      if (error) throw error

      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  async function markAllAsRead() {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("owner_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error marking all as read:", error)
    }
  }

  async function deleteNotification(id: string) {
    if (!user) return

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id).eq("owner_id", user.id)

      if (error) throw error

      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
    }
  }

  async function createNotification(notification: Omit<Notification, "id" | "owner_id" | "created_at" | "is_read">) {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            owner_id: user.id,
            dog_id: notification.dog_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            action_url: notification.action_url,
            scheduled_for: notification.scheduled_for,
          },
        ])
        .select()

      if (error) throw error

      await loadNotifications()
      return data?.[0]
    } catch (error) {
      console.error("[v0] Error creating notification:", error)
      throw error
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refreshNotifications: loadNotifications,
  }
}

export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<{
    notification_settings: {
      all: boolean
      vaccines: boolean
      feeding: boolean
      bath: boolean
      exercise: boolean
      events: boolean
    }
    app_preferences: {
      language: string
      weightUnit: string
      temperatureUnit: string
      dateFormat: string
    }
    dark_mode: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadPreferences = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle()

      if (error) throw error

      if (data) {
        setPreferences({
          notification_settings: data.notification_settings,
          app_preferences: data.app_preferences,
          dark_mode: data.dark_mode,
        })
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          user_id: user.id,
          notification_settings: {
            all: true,
            vaccines: true,
            feeding: true,
            bath: true,
            exercise: true,
            events: true,
          },
          app_preferences: {
            language: "pt",
            weightUnit: "kg",
            temperatureUnit: "celsius",
            dateFormat: "dd/mm/yyyy",
          },
          dark_mode: false,
        }

        const { data: newData, error: insertError } = await supabase
          .from("user_preferences")
          .insert(defaultPrefs)
          .select()
          .single()

        if (insertError) throw insertError

        setPreferences({
          notification_settings: newData.notification_settings,
          app_preferences: newData.app_preferences,
          dark_mode: newData.dark_mode,
        })
      }
    } catch (err) {
      console.error("[v0] Error loading preferences:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateNotificationSettings = async (settings: any) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({
          notification_settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      setPreferences((prev) => (prev ? { ...prev, notification_settings: settings } : null))
    } catch (err) {
      console.error("[v0] Error updating notification settings:", err)
      throw err
    }
  }

  const updateAppPreferences = async (appPrefs: any) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({
          app_preferences: appPrefs,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      setPreferences((prev) => (prev ? { ...prev, app_preferences: appPrefs } : null))
    } catch (err) {
      console.error("[v0] Error updating app preferences:", err)
      throw err
    }
  }

  const updateDarkMode = async (darkMode: boolean) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({
          dark_mode: darkMode,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (error) throw error

      setPreferences((prev) => (prev ? { ...prev, dark_mode: darkMode } : null))
    } catch (err) {
      console.error("[v0] Error updating dark mode:", err)
      throw err
    }
  }

  useEffect(() => {
    loadPreferences()

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel("user_preferences_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_preferences",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[v0] Preferences updated in real-time:", payload)
            if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
              setPreferences({
                notification_settings: payload.new.notification_settings,
                app_preferences: payload.new.app_preferences,
                dark_mode: payload.new.dark_mode,
              })
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  return {
    preferences,
    loading,
    updateNotificationSettings,
    updateAppPreferences,
    updateDarkMode,
    refreshPreferences: loadPreferences,
  }
}
