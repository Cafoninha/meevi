"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Clock, Trash2, Check, Sparkles, Trophy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useDogs, useFeeding, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import { format } from "date-fns"
import confetti from "canvas-confetti"

interface FeedingSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedingSection({ open, onOpenChange }: FeedingSectionProps) {
  const [foodBrand, setFoodBrand] = useState("Premier Pet")
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const [portionSize, setPortionSize] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newRecordId, setNewRecordId] = useState<string | null>(null)
  const { toast } = useToast()

  const { dogs, loading: dogsLoading } = useDogs()
  const { records, loading: recordsLoading, addRecord, deleteRecord } = useFeeding()
  const { addEntry: addDiaryEntry } = useDiaryEntries()

  useEffect(() => {
    if (dogs.length > 0 && !selectedDogId) {
      setSelectedDogId("all")
    }
  }, [dogs])

  useEffect(() => {
    if (newRecordId && records.some((r) => r.id === newRecordId)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      })
      setNewRecordId(null)
    }
  }, [records, newRecordId])

  const handleAddFeeding = async () => {
    if (!selectedDogId || selectedDogId === "") {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro está sendo alimentado.",
        variant: "destructive",
      })
      return
    }

    if (!foodBrand.trim()) {
      toast({
        title: "Marca da ração obrigatória",
        description: "Por favor, informe a marca da ração.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      const now = new Date()
      const dogsToFeed = selectedDogId === "all" ? dogs : dogs.filter((d) => d.id === selectedDogId)

      console.log("[v0] Adding feeding record for dogs:", dogsToFeed.map((d) => d.name).join(", "))

      for (const dog of dogsToFeed) {
        const newRecord = await addRecord({
          dog_id: dog.id,
          food_brand: foodBrand,
          meal_time: now.toISOString(),
          portion_size: portionSize || undefined,
          notes: undefined,
        })

        if (newRecord && dogsToFeed.length === 1) {
          setNewRecordId(newRecord.id)
        }

        await addDiaryEntry({
          dogId: dog.id,
          dogName: dog.name,
          type: "food",
          title: `Alimentação - ${foodBrand}`,
          notes: portionSize ? `Porção: ${portionSize}g` : "",
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
        })
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      const dogNames = dogsToFeed.map((d) => d.name).join(", ")
      toast({
        title: "🎉 Alimentação registrada!",
        description: `${dogNames} ${dogsToFeed.length > 1 ? "foram alimentados" : "foi alimentado"} com ${foodBrand} às ${format(now, "HH:mm")}`,
      })

      setPortionSize("")

      console.log("[v0] Feeding record(s) added successfully!")
    } catch (error) {
      console.error("[v0] Error adding feeding:", error)
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar a alimentação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id)
      toast({
        title: "Registro excluído",
        description: "Registro de alimentação excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      })
    }
  }

  const groupedRecords = records.reduce(
    (acc, record) => {
      const dog = dogs.find((d) => d.id === record.dog_id)
      if (!dog) return acc

      if (!acc[dog.name]) {
        acc[dog.name] = []
      }
      acc[dog.name].push(record)
      return acc
    },
    {} as Record<string, typeof records>,
  )

  const getTimeAgo = (mealTime: string) => {
    const now = new Date()
    const meal = new Date(mealTime)
    const diffMs = now.getTime() - meal.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`
    }
  }

  const todayFeedings = records.filter((r) => {
    const recordDate = format(new Date(r.meal_time), "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")
    return recordDate === today
  }).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Alimentação
            {todayFeedings >= 2 && (
              <span className="flex items-center gap-1 text-sm font-normal text-primary">
                <Trophy className="w-4 h-4" />
                {todayFeedings} refeições hoje!
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dog Selection */}
          <div className="space-y-2">
            <Label htmlFor="dog-select">Selecionar Cachorro</Label>
            <Select value={selectedDogId} onValueChange={setSelectedDogId} disabled={dogsLoading}>
              <SelectTrigger id="dog-select">
                <SelectValue placeholder={dogsLoading ? "Carregando..." : "Escolha o cachorro"} />
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
            <p className="text-xs text-muted-foreground">
              {selectedDogId === "all"
                ? "Registrar alimentação para todos os cachorros"
                : "Selecione qual cachorro está sendo alimentado"}
            </p>
          </div>

          {/* Food Brand */}
          <div className="space-y-2">
            <Label htmlFor="food-brand">Marca da Ração *</Label>
            <Input
              id="food-brand"
              placeholder="Ex: Premier Pet, Royal Canin..."
              value={foodBrand}
              onChange={(e) => setFoodBrand(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Informe a marca da ração que está oferecendo</p>
          </div>

          {/* Portion Size (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="portion-size">Porção em gramas (Opcional)</Label>
            <Input
              id="portion-size"
              type="number"
              placeholder="Ex: 80, 120..."
              value={portionSize}
              onChange={(e) => setPortionSize(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Quantidade de ração em gramas</p>
          </div>

          {/* Register Button */}
          <Button
            onClick={handleAddFeeding}
            className="w-full relative overflow-hidden"
            variant={showSuccess ? "default" : "default"}
            disabled={isSubmitting || !selectedDogId}
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Registrado!
                <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                {isSubmitting ? "Registrando..." : "Registrar Alimentação Agora"}
              </>
            )}
          </Button>

          {/* Feeding History */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Histórico de Alimentação</span>
              {records.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {records.length} registro{records.length > 1 ? "s" : ""}
                </span>
              )}
            </Label>
            {recordsLoading ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">Carregando histórico...</Card>
            ) : Object.keys(groupedRecords).length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                Nenhum registro de alimentação ainda
              </Card>
            ) : (
              <div className="space-y-3">
                {Object.entries(groupedRecords).map(([dogName, dogRecords]) => (
                  <div key={dogName} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <p className="text-sm font-semibold text-primary">{dogName}</p>
                    </div>
                    {dogRecords
                      .sort((a, b) => new Date(b.meal_time).getTime() - new Date(a.meal_time).getTime())
                      .slice(0, 5)
                      .map((record, index) => (
                        <Card
                          key={record.id}
                          className={`p-3 hover:bg-accent/50 transition-all duration-300 ${
                            record.id === newRecordId ? "animate-in slide-in-from-top-2 bg-primary/10" : ""
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span className="text-sm font-bold text-foreground">
                                  {format(new Date(record.meal_time), "HH:mm")}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{getTimeAgo(record.meal_time)}</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground pl-5">{record.food_brand}</p>
                              {record.portion_size && (
                                <p className="text-xs text-muted-foreground pl-5">Porção: {record.portion_size}g</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Dicas de Alimentação
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Cachorros devem comer 2-3 vezes ao dia</li>
              <li>• Porção recomendada varia conforme peso e idade</li>
              <li>• Sempre deixe água fresca disponível</li>
              <li>• Evite trocar a ração bruscamente</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FeedingSection
