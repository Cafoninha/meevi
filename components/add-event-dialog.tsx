"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Syringe, Stethoscope, Scissors, Pill, Bell, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/components/calendar-section"

interface Dog {
  id: string
  name: string
  birth_date: string
  breed: string
}

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (event: Omit<CalendarEvent, "id">) => void
  dogs: Dog[]
}

const eventTypes = [
  { value: "vaccine", label: "Vacina", icon: Syringe },
  { value: "vet", label: "Veterinário", icon: Stethoscope },
  { value: "grooming", label: "Banho/Tosa", icon: Scissors },
  { value: "medication", label: "Medicação", icon: Pill },
  { value: "reminder", label: "Lembrete", icon: Bell },
  { value: "other", label: "Outro", icon: Calendar },
] as const

export function AddEventDialog({ open, onOpenChange, onAdd, dogs }: AddEventDialogProps) {
  const [selectedType, setSelectedType] = useState<CalendarEvent["type"]>("reminder")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [time, setTime] = useState("09:00")
  const [repeat, setRepeat] = useState<CalendarEvent["repeat"]>("none")
  const [notifyBefore, setNotifyBefore] = useState<number>(60)
  const [selectedDogId, setSelectedDogId] = useState<string>("")

  useEffect(() => {
    if (open && dogs.length > 0 && !selectedDogId) {
      setSelectedDogId(dogs[0].id)
    }
  }, [open, dogs, selectedDogId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedDogId) return

    const selectedDog = dogs.find((d) => d.id === selectedDogId)

    onAdd({
      type: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time,
      repeat,
      notifyBefore,
      dogId: selectedDogId,
      dogName: selectedDog?.name,
    })

    setTitle("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
    setTime("09:00")
    setRepeat("none")
    setNotifyBefore(60)
    setSelectedType("reminder")
    setSelectedDogId(dogs.length > 0 ? dogs[0].id : "")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Novo Evento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-5 pb-4">
            <div className="space-y-2">
              <Label htmlFor="dog-select" className="text-sm font-semibold">
                Cachorro
              </Label>
              <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                <SelectTrigger id="dog-select" className="h-11">
                  <SelectValue placeholder="Selecione o cachorro" />
                </SelectTrigger>
                <SelectContent>
                  {dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Tipo de evento</Label>
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        selectedType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          selectedType === type.value ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          selectedType === type.value ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Título
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Vacina V10, Consulta veterinária..."
                required
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Observações (opcional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes importantes..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold">
                  Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            {/* Repeat */}
            <div className="space-y-2">
              <Label htmlFor="repeat" className="text-sm font-semibold">
                Repetir
              </Label>
              <Select value={repeat} onValueChange={(value) => setRepeat(value as CalendarEvent["repeat"])}>
                <SelectTrigger id="repeat" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não repetir</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification */}
            <div className="space-y-2">
              <Label htmlFor="notify" className="text-sm font-semibold">
                Notificar antes
              </Label>
              <Select value={String(notifyBefore)} onValueChange={(value) => setNotifyBefore(Number(value))}>
                <SelectTrigger id="notify" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos antes</SelectItem>
                  <SelectItem value="30">30 minutos antes</SelectItem>
                  <SelectItem value="60">1 hora antes</SelectItem>
                  <SelectItem value="120">2 horas antes</SelectItem>
                  <SelectItem value="1440">1 dia antes</SelectItem>
                  <SelectItem value="2880">2 dias antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <div className="px-6 pb-6 pt-4 border-t bg-background">
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              form="event-form"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-md"
              disabled={!title.trim() || !selectedDogId}
            >
              Salvar Evento
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full h-11">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
