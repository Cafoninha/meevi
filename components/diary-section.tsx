"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Utensils, Bath, Activity, Heart, Camera } from "lucide-react"
import { AddDiaryEntryDialog } from "@/components/add-diary-entry-dialog"
import { DiaryEntryCard } from "@/components/diary-entry-card"
import { useDiaryEntries, useDogs } from "@/lib/hooks/use-supabase-data"
import { Card } from "@/components/ui/card"

export interface DiaryEntry {
  id: string
  type: "food" | "bath" | "exercise" | "health" | "medication" | "grooming" | "other"
  title: string
  description?: string
  time: string
  date: string
  dogName?: string
  dogId?: string
}

export default function DiarySection() {
  const { entries: diaryEntries, loading: entriesLoading, deleteEntry } = useDiaryEntries()
  const { dogs } = useDogs()
  const { addEntry: addDiaryEntry } = useDiaryEntries()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const handleAddEntry = async (entry: Omit<DiaryEntry, "id">) => {
    try {
      await addDiaryEntry(entry)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error adding diary entry:", error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id)
    } catch (error) {
      console.error("[v0] Error deleting diary entry:", error)
    }
  }

  const filteredEntries = filter ? diaryEntries.filter((entry) => entry.type === filter) : diaryEntries

  const groupedEntries = filteredEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = []
      }
      acc[entry.date].push(entry)
      return acc
    },
    {} as Record<string, DiaryEntry[]>,
  )

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const firstDogName = dogs.length > 0 ? dogs[0].name : "seu pet"

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with actions */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">Diário de {firstDogName}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Acompanhe todos os cuidados</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Adicionar</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Quick filter buttons */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          <Button
            variant={filter === null ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 text-xs sm:text-sm"
            onClick={() => setFilter(null)}
          >
            Todos
          </Button>
          <Button
            variant={filter === "food" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 bg-transparent text-xs sm:text-sm"
            onClick={() => setFilter("food")}
          >
            <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Alimentação
          </Button>
          <Button
            variant={filter === "exercise" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 bg-transparent text-xs sm:text-sm"
            onClick={() => setFilter("exercise")}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Exercício
          </Button>
          <Button
            variant={filter === "bath" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 bg-transparent text-xs sm:text-sm"
            onClick={() => setFilter("bath")}
          >
            <Bath className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Banho
          </Button>
          <Button
            variant={filter === "health" ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 bg-transparent text-xs sm:text-sm"
            onClick={() => setFilter("health")}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Saúde
          </Button>
        </div>
      </div>

      {entriesLoading ? (
        <div className="px-3 sm:px-4 md:px-6 pb-4">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Carregando diário...</p>
          </Card>
        </div>
      ) : (
        /* Entries grouped by date */
        <div className="px-3 sm:px-4 md:px-6 pb-4 space-y-5 sm:space-y-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma entrada ainda</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                Comece a registrar os cuidados do seu pet
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="sm:size-default">
                <Plus className="w-4 h-4 mr-2" />
                Primeira Entrada
              </Button>
            </div>
          ) : (
            sortedDates.map((date) => {
              const dateObj = new Date(date + "T00:00:00")
              const isToday = date === new Date().toISOString().split("T")[0]
              const isYesterday = date === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

              let dateLabel = dateObj.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })

              if (isToday) {
                dateLabel = "Hoje"
              } else if (isYesterday) {
                dateLabel = "Ontem"
              }

              return (
                <div key={date}>
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3 capitalize">
                    {dateLabel}
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {groupedEntries[date]
                      .sort((a, b) => b.time.localeCompare(a.time))
                      .map((entry) => (
                        <DiaryEntryCard key={entry.id} entry={entry} onDelete={handleDeleteEntry} />
                      ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Add Entry Dialog */}
      <AddDiaryEntryDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddEntry} />
    </div>
  )
}
