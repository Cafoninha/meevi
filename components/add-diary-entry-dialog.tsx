"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Utensils, Bath, Activity, Heart, Pill, Scissors, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiaryEntry } from "@/components/diary-section"

interface Dog {
  id: string
  name: string
  breed: string
  age: number
  weight: number
  photo?: string
}

interface AddDiaryEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entry: Omit<DiaryEntry, "id">) => void
}

const entryTypes = [
  { value: "food", label: "Alimentação", icon: Utensils },
  { value: "exercise", label: "Exercício", icon: Activity },
  { value: "bath", label: "Banho", icon: Bath },
  { value: "health", label: "Saúde", icon: Heart },
  { value: "medication", label: "Medicação", icon: Pill },
  { value: "grooming", label: "Tosa", icon: Scissors },
  { value: "other", label: "Outro", icon: Camera },
] as const

export function AddDiaryEntryDialog({ open, onOpenChange, onAdd }: AddDiaryEntryDialogProps) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [dogId, setDogId] = useState<string>("")
  const [selectedType, setSelectedType] = useState<DiaryEntry["type"]>("food")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }),
  )
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (open) {
      const savedDogs = localStorage.getItem("dogs")
      if (savedDogs) {
        const parsedDogs = JSON.parse(savedDogs)
        setDogs(parsedDogs)
        if (parsedDogs.length > 0 && !dogId) {
          setDogId(parsedDogs[0].id)
        }
      }
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dogId) return

    const selectedDog = dogs.find((dog) => dog.id === dogId)

    onAdd({
      type: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
      time,
      date,
      dogId,
      dogName: selectedDog?.name,
    })

    setTitle("")
    setDescription("")
    setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }))
    setDate(new Date().toISOString().split("T")[0])
    setSelectedType("food")
    setDogId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Nova Entrada no Diário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dogId" className="text-xs sm:text-sm">
              Cachorro *
            </Label>
            <Select value={dogId} onValueChange={setDogId}>
              <SelectTrigger className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Selecione um cachorro" />
              </SelectTrigger>
              <SelectContent>
                {dogs.length === 0 ? (
                  <div className="p-2 text-xs sm:text-sm text-muted-foreground text-center">
                    Nenhum cachorro cadastrado
                  </div>
                ) : (
                  dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id} className="text-xs sm:text-sm">
                      {dog.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm">Tipo de atividade</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {entryTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all",
                      selectedType === type.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        selectedType === type.value ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-medium text-center leading-tight",
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

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Almoço, Passeio no parque..."
              required
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">
              Observações (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes sobre esta atividade..."
              rows={3}
              className="text-xs sm:text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs sm:text-sm">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs sm:text-sm">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-9 sm:h-10 text-xs sm:text-sm" disabled={!title.trim() || !dogId}>
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
