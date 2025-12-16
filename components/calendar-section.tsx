"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight, CalendarIcon, Check, Clock } from "lucide-react"
import { AddEventDialog } from "@/components/add-event-dialog"
import { EventCard } from "@/components/event-card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  time: string
  type: "vaccine" | "vet" | "grooming" | "medication" | "reminder" | "other"
  repeat?: "none" | "daily" | "weekly" | "monthly"
  notifyBefore?: number
  dogId?: string
  dogName?: string
  completed?: boolean
}

interface Dog {
  id: string
  name: string
  birth_date: string
  breed: string
}

export function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    loadDogs()
    loadEvents()
  }, [])

  const loadDogs = () => {
    try {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        setDogs(JSON.parse(storedDogs))
      }
    } catch (error) {
      console.error("[v0] Error loading dogs:", error)
    }
  }

  const loadEvents = () => {
    try {
      const storedEvents = localStorage.getItem("calendarEvents")
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents))
      }
    } catch (error) {
      console.error("[v0] Error loading events:", error)
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos do calendário.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEvent = (event: Omit<CalendarEvent, "id">) => {
    try {
      const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID(),
      }

      const updatedEvents = [...events, newEvent].sort(
        (a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime(),
      )

      setEvents(updatedEvents)
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
      setShowAddDialog(false)

      toast({
        title: "Evento adicionado",
        description: "O evento foi salvo com sucesso.",
      })
    } catch (error) {
      console.error("[v0] Error adding event:", error)
      toast({
        title: "Erro ao adicionar evento",
        description: "Não foi possível salvar o evento.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = (id: string) => {
    try {
      const updatedEvents = events.filter((event) => event.id !== id)
      setEvents(updatedEvents)
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))

      toast({
        title: "Evento removido",
        description: "O evento foi excluído com sucesso.",
      })
    } catch (error) {
      console.error("[v0] Error deleting event:", error)
      toast({
        title: "Erro ao remover evento",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteEvent = (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) return

      // Mark event as completed
      const updatedEvents = events.map((e) => (e.id === eventId ? { ...e, completed: true } : e))
      setEvents(updatedEvents)
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))

      // Add to diary
      const diary = JSON.parse(localStorage.getItem("diary") || "[]")
      const now = new Date()
      const diaryEntry = {
        id: crypto.randomUUID(),
        type: event.type === "vaccine" || event.type === "medication" ? "health" : "other",
        category: event.type,
        title: event.title,
        description: event.description || "",
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        dogId: event.dogId,
        dogName: event.dogName,
      }

      diary.push(diaryEntry)
      localStorage.setItem("diary", JSON.stringify(diary))

      toast({
        title: "Evento concluído",
        description: "O evento foi marcado como concluído e adicionado ao diário.",
      })
    } catch (error) {
      console.error("[v0] Error completing event:", error)
      toast({
        title: "Erro ao concluir evento",
        description: "Não foi possível concluir o evento.",
        variant: "destructive",
      })
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekFromNowStr = weekFromNow.toISOString().split("T")[0]

  const filteredEvents = events.filter((event) => {
    const dogMatch = selectedDogId === "all" || event.dogId === selectedDogId
    const typeMatch = filterType === "all" || event.type === filterType
    return dogMatch && typeMatch
  })

  const todayEvents = filteredEvents.filter((event) => event.date === todayStr && !event.completed)
  const tomorrowEvents = filteredEvents.filter((event) => event.date === tomorrowStr && !event.completed)
  const upcomingEvents = filteredEvents.filter(
    (event) => event.date > tomorrowStr && event.date <= weekFromNowStr && !event.completed,
  )
  const laterEvents = filteredEvents.filter((event) => event.date > weekFromNowStr && !event.completed)
  const pastEvents = filteredEvents.filter((event) => event.date < todayStr && !event.completed)
  const completedEvents = filteredEvents.filter((event) => event.completed)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold">Calendário de Cuidados</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Organize vacinas, consultas e lembretes</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span>Adicionar</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
          <div>
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todos os cachorros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cachorros</SelectItem>
                {dogs.map((dog) => (
                  <SelectItem key={dog.id} value={dog.id}>
                    {dog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="vaccine">Vacinas</SelectItem>
                <SelectItem value="vet">Veterinário</SelectItem>
                <SelectItem value="grooming">Banho/Tosa</SelectItem>
                <SelectItem value="medication">Medicação</SelectItem>
                <SelectItem value="reminder">Lembretes</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="h-8 sm:h-9 px-2 sm:px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-base sm:text-lg font-bold text-center flex-1">
            {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="h-8 sm:h-9 px-2 sm:px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Mini Calendar */}
        <div className="px-3 sm:px-4 md:px-6">
          <MiniCalendar currentDate={currentDate} events={filteredEvents} setSelectedDate={setSelectedDate} />
        </div>
      </div>

      {/* Events List */}
      <div className="px-3 sm:px-4 md:px-6 pb-4">
        <h3 className="text-sm sm:text-base font-bold mb-3 sm:mb-4">Próximos Eventos</h3>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum evento</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              {filterType !== "all" ? "Tente outro filtro" : "Adicione seu primeiro evento"}
            </p>
            {filterType === "all" && (
              <Button onClick={() => setShowAddDialog(true)} size="sm" className="sm:size-default">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Evento
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {todayEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm sm:text-base font-semibold text-red-500 uppercase tracking-wide">Hoje</h3>
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    {todayEvents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={handleDeleteEvent}
                      onComplete={handleCompleteEvent}
                    />
                  ))}
                </div>
              </div>
            )}

            {tomorrowEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm sm:text-base font-semibold text-orange-500 uppercase tracking-wide">Amanhã</h3>
                  <Badge className="text-xs sm:text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
                    {tomorrowEvents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {tomorrowEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={handleDeleteEvent}
                      onComplete={handleCompleteEvent}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm sm:text-base font-semibold text-primary uppercase tracking-wide">
                    Próximos 7 dias
                  </h3>
                  <Badge className="text-xs sm:text-sm bg-primary/10 text-primary border-primary/20">
                    {upcomingEvents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={handleDeleteEvent}
                      onComplete={handleCompleteEvent}
                    />
                  ))}
                </div>
              </div>
            )}

            {laterEvents.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4">
                  Mais tarde
                </h3>
                <div className="space-y-3">
                  {laterEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={handleDeleteEvent}
                      onComplete={handleCompleteEvent}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm sm:text-base font-semibold text-green-500 uppercase tracking-wide">
                    Concluídos
                  </h3>
                  <Badge className="text-xs sm:text-sm bg-green-500/10 text-green-600 border-green-500/20">
                    {completedEvents.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {completedEvents.map((event) => (
                    <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} isCompleted />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4">
                  Atrasados
                </h3>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={handleDeleteEvent}
                      onComplete={handleCompleteEvent}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddEvent} dogs={dogs} />
    </div>
  )
}

function MiniCalendar({
  currentDate,
  events,
  setSelectedDate,
}: {
  currentDate: Date
  events: CalendarEvent[]
  setSelectedDate: (date: Date | null) => void
}) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "vaccine":
        return "bg-blue-500"
      case "vet":
        return "bg-red-500"
      case "grooming":
        return "bg-purple-500"
      case "medication":
        return "bg-green-500"
      case "reminder":
        return "bg-primary"
      case "other":
        return "bg-gray-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <Card className="p-3 sm:p-4">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
          <div key={i} className="text-[10px] sm:text-xs font-semibold text-muted-foreground pb-1 sm:pb-2">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          const isToday = isCurrentMonth && day === today.getDate()
          const dayEvents = day ? getEventsForDay(day) : []
          const hasActiveEvents = dayEvents.some((e) => !e.completed)
          const hasCompletedEvents = dayEvents.some((e) => e.completed)

          return (
            <div
              key={i}
              className={cn(
                "aspect-square flex flex-col items-center justify-center text-xs sm:text-sm rounded-md sm:rounded-lg relative cursor-pointer transition-colors",
                day
                  ? isToday
                    ? "bg-primary text-primary-foreground font-semibold"
                    : hasActiveEvents
                      ? "bg-accent/30 font-medium hover:bg-accent/50"
                      : hasCompletedEvents
                        ? "bg-green-500/10 hover:bg-green-500/20"
                        : "hover:bg-secondary"
                  : "",
              )}
              onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              {day || ""}
              {hasActiveEvents && (
                <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={cn("w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full", {
                        "bg-green-500": event.completed,
                        [getEventColor(event.type)]: !event.completed,
                      })}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-2">Legenda:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">Vacina</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">Veterinário</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">Banho/Tosa</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">Medicação</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-muted-foreground truncate">Lembrete</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">Outro</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
