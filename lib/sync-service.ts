"use client"

import { createClient } from "@/lib/supabase/client"

export interface SyncStatus {
  isSuccess: boolean
  message: string
  lastSync?: string
}

export class SyncService {
  private supabase = createClient()

  async syncToCloud(ownerId: string): Promise<SyncStatus> {
    try {
      console.log("[v0] Starting cloud sync for owner:", ownerId)

      // Buscar dados do localStorage
      const owner = JSON.parse(localStorage.getItem("owner") || "{}")
      const dogs = JSON.parse(localStorage.getItem("dogs") || "[]")
      const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")
      const documents = JSON.parse(localStorage.getItem("meevi_documents") || "[]")
      const events = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
      const contacts = JSON.parse(localStorage.getItem("meevi_contacts") || "[]")

      // 1. Sincronizar owner
      if (owner.id) {
        const { error: ownerError } = await this.supabase.from("owners").upsert({
          id: owner.id,
          name: owner.name,
          email: owner.email || null,
          phone: owner.phone || null,
          age: owner.age || null,
          gender: owner.gender || null,
          location: owner.location || null,
          photo_url: owner.photo || null,
        })

        if (ownerError) throw ownerError
      }

      // 2. Sincronizar dogs
      for (const dog of dogs) {
        const birthDate = dog.birthDate || new Date().toISOString().split("T")[0] // Use today as default

        const { error: dogError } = await this.supabase.from("dogs").upsert({
          id: dog.id,
          owner_id: ownerId,
          name: dog.name,
          breed: dog.breed || null,
          birth_date: birthDate,
          photo: dog.photo || null,
        })

        if (dogError) throw dogError

        // Sincronizar status de vacinas deste cachorro
        const vaccineKeys = Object.keys(localStorage).filter((key) => key.startsWith(`meevi_vaccine_status_${dog.id}`))

        for (const key of vaccineKeys) {
          const vaccineData = JSON.parse(localStorage.getItem(key) || "{}")
          const vaccineName = key.replace(`meevi_vaccine_status_${dog.id}_`, "")

          const { error: vaccineError } = await this.supabase.from("vaccine_status").upsert({
            owner_id: ownerId,
            dog_id: dog.id,
            vaccine_name: vaccineName,
            status: vaccineData.status || "pending",
            date: vaccineData.date || null,
            next_date: vaccineData.nextDate || null,
            notes: vaccineData.notes || null,
          })

          if (vaccineError) throw vaccineError
        }
      }

      // 3. Sincronizar diary entries
      for (const entry of diaryEntries) {
        const { error: diaryError } = await this.supabase.from("diary_entries").upsert({
          id: entry.id,
          owner_id: ownerId,
          dog_id: entry.dogId || null,
          dog_name: entry.dogName || null,
          type: entry.type,
          title: entry.title,
          notes: entry.notes || null,
          date: entry.date,
          time: entry.time,
        })

        if (diaryError) throw diaryError
      }

      // 4. Sincronizar documents
      for (const doc of documents) {
        const { error: docError } = await this.supabase.from("documents").upsert({
          id: doc.id,
          owner_id: ownerId,
          dog_id: doc.dogId || null,
          title: doc.title,
          type: doc.type,
          file_url: doc.fileUrl || null,
          notes: doc.notes || null,
          issue_date: doc.issueDate || null,
          expiry_date: doc.expiryDate || null,
        })

        if (docError) throw docError
      }

      // 5. Sincronizar calendar events
      for (const event of events) {
        const { error: eventError } = await this.supabase.from("calendar_events").upsert({
          id: event.id,
          dog_id: event.dogId || null,
          title: event.title,
          description: event.description || null,
          type: event.type || "other",
          date: event.date,
          time: event.time,
          repeat: event.repeat || null,
          notify_before: event.notifyBefore || null,
        })

        if (eventError) throw eventError
      }

      // 6. Sincronizar emergency contacts
      for (const contact of contacts) {
        const { error: contactError } = await this.supabase.from("emergency_contacts").upsert({
          id: contact.id,
          owner_id: ownerId,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship || null,
          notes: contact.notes || null,
        })

        if (contactError) throw contactError
      }

      // Salvar timestamp do último sync
      const lastSync = new Date().toISOString()
      localStorage.setItem("lastCloudSync", lastSync)

      console.log("[v0] Cloud sync completed successfully")

      return {
        isSuccess: true,
        message: "Dados sincronizados com sucesso!",
        lastSync,
      }
    } catch (error) {
      console.error("[v0] Error syncing to cloud:", error)
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : "Erro ao sincronizar dados",
      }
    }
  }

  async syncFromCloud(ownerId: string): Promise<SyncStatus> {
    try {
      console.log("[v0] Starting sync from cloud for owner:", ownerId)

      // 1. Buscar owner
      const { data: owner, error: ownerError } = await this.supabase
        .from("owners")
        .select("*")
        .eq("id", ownerId)
        .single()

      if (ownerError && ownerError.code !== "PGRST116") throw ownerError

      if (owner) {
        localStorage.setItem(
          "owner",
          JSON.stringify({
            id: owner.id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            age: owner.age,
            gender: owner.gender,
            location: owner.location,
            photo: owner.photo_url,
          }),
        )
      }

      // 2. Buscar dogs
      const { data: dogs, error: dogsError } = await this.supabase.from("dogs").select("*").eq("owner_id", ownerId)

      if (dogsError) throw dogsError

      if (dogs) {
        localStorage.setItem(
          "dogs",
          JSON.stringify(
            dogs.map((dog) => ({
              id: dog.id,
              name: dog.name,
              breed: dog.breed,
              birthDate: dog.birth_date,
              photo: dog.photo,
            })),
          ),
        )

        // Buscar vaccine status para cada cachorro
        for (const dog of dogs) {
          const { data: vaccines, error: vaccinesError } = await this.supabase
            .from("vaccine_status")
            .select("*")
            .eq("dog_id", dog.id)

          if (vaccinesError) throw vaccinesError

          if (vaccines) {
            vaccines.forEach((vaccine) => {
              localStorage.setItem(
                `meevi_vaccine_status_${dog.id}_${vaccine.vaccine_name}`,
                JSON.stringify({
                  status: vaccine.status,
                  date: vaccine.date,
                  nextDate: vaccine.next_date,
                  notes: vaccine.notes,
                }),
              )
            })
          }
        }
      }

      // 3. Buscar diary entries
      const { data: diaryEntries, error: diaryError } = await this.supabase
        .from("diary_entries")
        .select("*")
        .eq("owner_id", ownerId)
        .order("date", { ascending: false })

      if (diaryError) throw diaryError

      if (diaryEntries) {
        localStorage.setItem(
          "meevi_diary_entries",
          JSON.stringify(
            diaryEntries.map((entry) => ({
              id: entry.id,
              dogId: entry.dog_id,
              dogName: entry.dog_name,
              type: entry.type,
              title: entry.title,
              notes: entry.notes,
              date: entry.date,
              time: entry.time,
            })),
          ),
        )
      }

      // 4. Buscar documents
      const { data: documents, error: docsError } = await this.supabase
        .from("documents")
        .select("*")
        .eq("owner_id", ownerId)

      if (docsError) throw docsError

      if (documents) {
        localStorage.setItem(
          "meevi_documents",
          JSON.stringify(
            documents.map((doc) => ({
              id: doc.id,
              dogId: doc.dog_id,
              title: doc.title,
              type: doc.type,
              fileUrl: doc.file_url,
              notes: doc.notes,
              issueDate: doc.issue_date,
              expiryDate: doc.expiry_date,
            })),
          ),
        )
      }

      // 5. Buscar calendar events
      const { data: events, error: eventsError } = await this.supabase.from("calendar_events").select("*")

      if (eventsError) throw eventsError

      if (events) {
        localStorage.setItem(
          "calendarEvents",
          JSON.stringify(
            events.map((event) => ({
              id: event.id,
              dogId: event.dog_id,
              title: event.title,
              description: event.description,
              type: event.type,
              date: event.date,
              time: event.time,
              repeat: event.repeat,
              notifyBefore: event.notify_before,
            })),
          ),
        )
      }

      // 6. Buscar emergency contacts
      const { data: contacts, error: contactsError } = await this.supabase
        .from("emergency_contacts")
        .select("*")
        .eq("owner_id", ownerId)

      if (contactsError) throw contactsError

      if (contacts) {
        localStorage.setItem(
          "meevi_contacts",
          JSON.stringify(
            contacts.map((contact) => ({
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship,
              notes: contact.notes,
            })),
          ),
        )
      }

      // Salvar timestamp do último sync
      const lastSync = new Date().toISOString()
      localStorage.setItem("lastCloudSync", lastSync)

      console.log("[v0] Sync from cloud completed successfully")

      return {
        isSuccess: true,
        message: "Dados baixados com sucesso da nuvem!",
        lastSync,
      }
    } catch (error) {
      console.error("[v0] Error syncing from cloud:", error)
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : "Erro ao baixar dados",
      }
    }
  }

  getLastSyncTime(): string | null {
    return localStorage.getItem("lastCloudSync")
  }
}
