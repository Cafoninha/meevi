import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("notification_settings")
      .eq("user_id", user.id)
      .maybeSingle()

    const notificationSettings = preferences?.notification_settings || {
      all: true,
      vaccines: true,
      feeding: true,
      bath: true,
      exercise: true,
      events: true,
    }

    if (!notificationSettings.all) {
      console.log("[v0] All notifications disabled by user")
      return NextResponse.json({ success: true, created: 0, notifications: [], disabled: true })
    }

    const notifications = []

    if (notificationSettings.vaccines) {
      const { data: vaccines, error: vaccineError } = await supabase
        .from("vaccine_status")
        .select("*, dogs(name)")
        .eq("owner_id", user.id)
        .eq("status", "pending")
        .lt("next_date", new Date().toISOString().split("T")[0])

      if (!vaccineError && vaccines && vaccines.length > 0) {
        for (const vaccine of vaccines) {
          const dogName = vaccine.dogs?.name || "Seu cachorro"

          const { data: existingNotification } = await supabase
            .from("notifications")
            .select("id")
            .eq("owner_id", user.id)
            .eq("dog_id", vaccine.dog_id)
            .eq("type", "vaccine")
            .eq("is_read", false)
            .ilike("message", `%${vaccine.vaccine_name}%`)
            .maybeSingle()

          if (!existingNotification) {
            const { error: insertError } = await supabase.from("notifications").insert([
              {
                owner_id: user.id,
                dog_id: vaccine.dog_id,
                type: "vaccine",
                title: "Vacina Atrasada",
                message: `${dogName} está com a vacina ${vaccine.vaccine_name} atrasada!`,
                is_read: false,
              },
            ])

            if (!insertError) {
              notifications.push({ type: "vaccine", vaccine: vaccine.vaccine_name, dog: dogName })
            }
          }
        }
      }
    }

    if (notificationSettings.feeding) {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      const { data: dogs } = await supabase.from("dogs").select("*").eq("owner_id", user.id)

      if (dogs) {
        for (const dog of dogs) {
          const { data: recentFeedings } = await supabase
            .from("feeding_records")
            .select("*")
            .eq("dog_id", dog.id)
            .gte("meal_time", threeHoursAgo)
            .order("meal_time", { ascending: false })
            .limit(1)

          if (!recentFeedings || recentFeedings.length === 0) {
            const { data: existingNotification } = await supabase
              .from("notifications")
              .select("id")
              .eq("owner_id", user.id)
              .eq("dog_id", dog.id)
              .eq("type", "feeding")
              .eq("is_read", false)
              .maybeSingle()

            if (!existingNotification) {
              const { data: lastFeeding } = await supabase
                .from("feeding_records")
                .select("meal_time")
                .eq("dog_id", dog.id)
                .order("meal_time", { ascending: false })
                .limit(1)
                .maybeSingle()

              let message = `${dog.name} pode estar com fome! `

              if (lastFeeding) {
                const lastFeedingTime = new Date(lastFeeding.meal_time)
                const hoursSinceFeeding = Math.floor((Date.now() - lastFeedingTime.getTime()) / (1000 * 60 * 60))
                message += `Última alimentação há ${hoursSinceFeeding} hora${hoursSinceFeeding !== 1 ? "s" : ""}.`
              } else {
                message += "Nenhum registro de alimentação hoje."
              }

              const { error: insertError } = await supabase.from("notifications").insert([
                {
                  owner_id: user.id,
                  dog_id: dog.id,
                  type: "feeding",
                  title: "Hora da Refeição",
                  message,
                  is_read: false,
                },
              ])

              if (!insertError) {
                notifications.push({ type: "feeding", dog: dog.name })
              }
            }
          }
        }
      }
    }

    if (notificationSettings.events) {
      const today = new Date().toISOString().split("T")[0]
      const todayMonthDay = today.substring(5)
      const { data: dogs } = await supabase.from("dogs").select("*").eq("owner_id", user.id)

      if (dogs) {
        for (const dog of dogs) {
          const dogBirthdayMonthDay = dog.birth_date.substring(5)

          if (dogBirthdayMonthDay === todayMonthDay) {
            const { data: existingNotification } = await supabase
              .from("notifications")
              .select("id")
              .eq("owner_id", user.id)
              .eq("dog_id", dog.id)
              .eq("type", "birthday")
              .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
              .maybeSingle()

            if (!existingNotification) {
              const { error: insertError } = await supabase.from("notifications").insert([
                {
                  owner_id: user.id,
                  dog_id: dog.id,
                  type: "birthday",
                  title: "Feliz Aniversário!",
                  message: `Hoje é o aniversário do ${dog.name}! 🎉`,
                  is_read: false,
                },
              ])

              if (!insertError) {
                notifications.push({ type: "birthday", dog: dog.name })
              }
            }
          }
        }
      }
    }

    console.log("[v0] Notifications check completed:", { created: notifications.length, notifications })
    return NextResponse.json({ success: true, created: notifications.length, notifications })
  } catch (error) {
    console.error("[v0] Error checking notifications:", error)
    return NextResponse.json({ error: "Failed to check notifications" }, { status: 500 })
  }
}
