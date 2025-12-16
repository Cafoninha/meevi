"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Clock, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface FeedingSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Dog {
  id: string
  name: string
}

interface FeedingHistoryEntry {
  time: string
  brand: string
  date: string
  dogName?: string
  fullDate?: string
}

export function FeedingSection({ open, onOpenChange }: FeedingSectionProps) {
  const [foodBrand, setFoodBrand] = useState("Premier Pet")
  const [lastFeedingTime, setLastFeedingTime] = useState("14:30")
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistoryEntry[]>([])
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadDogs()
    }
  }, [open])

  useEffect(() => {
    const saved = localStorage.getItem("meevi_feeding_history")
    if (saved) {
      setFeedingHistory(JSON.parse(saved))
    } else {
      setFeedingHistory([
        { time: "14:30", brand: "Premier Pet", date: "Hoje" },
        { time: "08:00", brand: "Premier Pet", date: "Hoje" },
        { time: "19:30", brand: "Premier Pet", date: "Ontem" },
      ])
    }

    const savedDogSelection = localStorage.getItem("meevi_feeding_selected_dog")
    if (savedDogSelection) {
      setSelectedDogId(savedDogSelection)
    }
  }, [])

  useEffect(() => {
    if (selectedDogId) {
      localStorage.setItem("meevi_feeding_selected_dog", selectedDogId)
    }
  }, [selectedDogId])

  const loadDogs = () => {
    try {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        const parsedDogs = JSON.parse(storedDogs)
        setDogs(Array.isArray(parsedDogs) ? parsedDogs : [])
      } else {
        // Try legacy format
        const legacyDog = localStorage.getItem("dogData")
        if (legacyDog) {
          const dogData = JSON.parse(legacyDog)
          const migratedDogs = [{ id: dogData.id || Date.now().toString(), name: dogData.name }]
          setDogs(migratedDogs)
          localStorage.setItem("dogs", JSON.stringify(migratedDogs))
        }
      }
    } catch (error) {
      console.error("Error loading dogs:", error)
      setDogs([])
    }
  }

  const handleSave = () => {
    if (dogs.length === 0) {
      toast({
        title: "Nenhum cachorro cadastrado",
        description: "Por favor, cadastre um cachorro primeiro.",
        variant: "destructive",
      })
      return
    }

    if (!selectedDogId || selectedDogId === "") {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro está sendo alimentado.",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const dateString = now.toISOString().split("T")[0]

    const selectedDog = selectedDogId === "all" ? null : dogs.find((d) => d.id === selectedDogId)
    const dogNameForHistory = selectedDogId === "all" ? "Todos os cachorros" : selectedDog?.name

    const newEntry: FeedingHistoryEntry = {
      time: timeString,
      brand: foodBrand,
      date: "Hoje",
      fullDate: dateString,
      dogName: dogNameForHistory,
    }
    const updatedHistory = [newEntry, ...feedingHistory.slice(0, 9)]

    setLastFeedingTime(timeString)
    setFeedingHistory(updatedHistory)
    localStorage.setItem("meevi_feeding_history", JSON.stringify(updatedHistory))

    // Add to global diary
    const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")

    if (selectedDogId === "all") {
      // Register for all dogs
      dogs.forEach((dog) => {
        diaryEntries.unshift({
          id: `${Date.now()}-${dog.id}`,
          type: "food",
          title: `Alimentação - ${foodBrand}`,
          description: `Marca: ${foodBrand}`,
          time: timeString,
          date: dateString,
          dogId: dog.id,
          dogName: dog.name,
        })
      })
      toast({
        title: "Alimentação registrada!",
        description: `Alimentação de todos os cachorros registrada com sucesso.`,
      })
    } else {
      // Register for selected dog
      diaryEntries.unshift({
        id: Date.now().toString(),
        type: "food",
        title: `Alimentação - ${foodBrand}`,
        description: `Marca: ${foodBrand}`,
        time: timeString,
        date: dateString,
        dogId: selectedDogId,
        dogName: selectedDog?.name,
      })
      toast({
        title: "Alimentação registrada!",
        description: `Alimentação de ${selectedDog?.name} registrada com sucesso.`,
      })
    }

    localStorage.setItem("meevi_diary_entries", JSON.stringify(diaryEntries))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Alimentação</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="dog-select">Selecionar Cachorro</Label>
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger id="dog-select">
                <SelectValue placeholder="Escolha o cachorro" />
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
            <p className="text-xs text-muted-foreground">Selecione qual cachorro está sendo alimentado</p>
          </div>

          {/* Current Food Brand */}
          <div className="space-y-2">
            <Label htmlFor="food-brand">Marca da Ração</Label>
            <Input
              id="food-brand"
              placeholder="Ex: Premier Pet, Royal Canin..."
              value={foodBrand}
              onChange={(e) => setFoodBrand(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Mantenha registro da ração que você está oferecendo ao seu Spitz
            </p>
          </div>

          {/* Last Feeding Time */}
          <div className="space-y-2">
            <Label htmlFor="feeding-time">Último Horário de Alimentação</Label>
            <div className="flex gap-2">
              <Input
                id="feeding-time"
                type="time"
                value={lastFeedingTime}
                onChange={(e) => setLastFeedingTime(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSave} size="icon">
                <Save className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Registre o horário que você alimentou seu cachorro</p>
          </div>

          {/* Quick Time Buttons */}
          <div className="space-y-2">
            <Label>Alimentar Agora</Label>
            <Button onClick={handleSave} className="w-full" variant="default">
              <Clock className="w-4 h-4 mr-2" />
              Registrar Alimentação Agora
            </Button>
          </div>

          {/* Feeding History */}
          <div className="space-y-2">
            <Label>Histórico de Alimentação</Label>
            <div className="space-y-2">
              {feedingHistory.map((feed, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{feed.brand}</p>
                      {feed.dogName && <p className="text-xs font-medium text-primary">{feed.dogName}</p>}
                      <p className="text-xs text-muted-foreground">{feed.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{feed.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm mb-2">Dicas de Alimentação</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Spitz Alemão deve comer 2-3 vezes ao dia</li>
              <li>• Porção recomendada: 80-120g por dia (adulto)</li>
              <li>• Sempre deixe água fresca disponível</li>
              <li>• Evite trocar a ração bruscamente</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
