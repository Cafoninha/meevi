"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HealthSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Dog {
  id: string
  name: string
  breed: string
  birth_date: string
}

export function HealthSection({ open, onOpenChange }: HealthSectionProps) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>("")
  const { toast } = useToast()

  const calculateAgeInMonths = (birthDate: string): number => {
    const [year, month, day] = birthDate.split("-").map(Number)
    const birth = new Date(year, month - 1, day)
    const today = new Date()

    const yearsDiff = today.getFullYear() - birth.getFullYear()
    const monthsDiff = today.getMonth() - birth.getMonth()
    const daysDiff = today.getDate() - birth.getDate()

    let totalMonths = yearsDiff * 12 + monthsDiff
    if (daysDiff < 0) {
      totalMonths -= 1
    }

    return Math.max(0, totalMonths)
  }

  const calculateAgeDisplay = (birthDate: string): string => {
    const [year, month, day] = birthDate.split("-").map(Number)
    const birth = new Date(year, month - 1, day)
    const today = new Date()

    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    const daysDiff = today.getDate() - birth.getDate()

    if (years === 0) {
      const totalMonths = months + (daysDiff < 0 ? -1 : 0)
      return `${totalMonths} ${totalMonths === 1 ? "mês" : "meses"} de idade`
    } else if (months < 0 || (months === 0 && daysDiff < 0)) {
      const adjustedYears = years - 1
      return `${adjustedYears} ${adjustedYears === 1 ? "ano" : "anos"} de idade`
    }
    return `${years} ${years === 1 ? "ano" : "anos"} de idade`
  }

  const selectedDog = dogs.find((d) => d.id === selectedDogId)
  const dogAgeMonths = selectedDog ? calculateAgeInMonths(selectedDog.birth_date) : 0
  const dogAgeDisplay = selectedDog ? calculateAgeDisplay(selectedDog.birth_date) : "idade desconhecida"

  const vaccineSchedule = [
    {
      name: "V8 ou V10 (Primeira dose)",
      ageMonths: 2,
      description: "Proteção contra cinomose, parvovirose, hepatite, etc.",
      checked: false,
    },
    {
      name: "V8 ou V10 (Segunda dose)",
      ageMonths: 3,
      description: "Reforço da primeira dose",
      checked: false,
    },
    {
      name: "V8 ou V10 (Terceira dose)",
      ageMonths: 4,
      description: "Reforço final do protocolo inicial",
      checked: false,
    },
    {
      name: "Raiva (Primeira dose)",
      ageMonths: 4,
      description: "Proteção contra raiva - obrigatória por lei",
      checked: false,
    },
    {
      name: "V8 ou V10 (Reforço anual)",
      ageMonths: 16,
      description: "Reforço anual da polivalente",
      checked: false,
    },
    {
      name: "Raiva (Reforço anual)",
      ageMonths: 16,
      description: "Reforço anual da raiva",
      checked: false,
    },
    {
      name: "V8 ou V10 (Reforço - 2 anos)",
      ageMonths: 28,
      description: "Reforço anual da polivalente",
      checked: false,
    },
    {
      name: "Raiva (Reforço - 2 anos)",
      ageMonths: 28,
      description: "Reforço anual da raiva",
      checked: false,
    },
    {
      name: "Giardíase (Opcional)",
      ageMonths: 2,
      description: "Proteção contra giárdia",
      checked: false,
    },
    {
      name: "Gripe Canina (Opcional)",
      ageMonths: 3,
      description: "Tosse dos canis",
      checked: false,
    },
  ]

  const [vaccines, setVaccines] = useState(vaccineSchedule)

  useEffect(() => {
    if (open) {
      loadDogs()
    }
  }, [open])

  const loadDogs = () => {
    try {
      const dogsData = localStorage.getItem("dogs")
      if (dogsData) {
        const parsedDogs = JSON.parse(dogsData)
        setDogs(parsedDogs)
        const savedDogSelection = localStorage.getItem("meevi_health_selected_dog")
        if (savedDogSelection) {
          setSelectedDogId(savedDogSelection)
        } else if (parsedDogs.length > 0) {
          setSelectedDogId(parsedDogs[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading dogs:", error)
    }
  }

  useEffect(() => {
    if (selectedDogId) {
      localStorage.setItem("meevi_health_selected_dog", selectedDogId)
    }
  }, [selectedDogId])

  useEffect(() => {
    if (selectedDogId) {
      const saved = localStorage.getItem(`meevi_vaccine_status_${selectedDogId}`)
      if (saved) {
        setVaccines(JSON.parse(saved))
      } else {
        setVaccines(vaccineSchedule)
      }
    }
  }, [selectedDogId])

  const toggleVaccine = (index: number) => {
    if (!selectedDogId) {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro recebeu a vacina",
        variant: "destructive",
      })
      return
    }

    const selectedDog = dogs.find((d) => d.id === selectedDogId)

    const newVaccines = [...vaccines]
    newVaccines[index].checked = !newVaccines[index].checked
    setVaccines(newVaccines)

    localStorage.setItem(`meevi_vaccine_status_${selectedDogId}`, JSON.stringify(newVaccines))

    if (newVaccines[index].checked) {
      const now = new Date()
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      const dateString = now.toISOString().split("T")[0]

      const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")
      diaryEntries.unshift({
        id: Date.now().toString(),
        type: "health",
        title: `Vacina: ${newVaccines[index].name}`,
        description: newVaccines[index].description,
        time: timeString,
        date: dateString,
        dogId: selectedDogId,
        dogName: selectedDog?.name || "Cachorro",
      })
      localStorage.setItem("meevi_diary_entries", JSON.stringify(diaryEntries))

      toast({
        title: "Vacina registrada!",
        description: `${selectedDog?.name} recebeu: ${newVaccines[index].name}`,
      })
    }
  }

  const completedCount = vaccines.filter((v) => v.checked && v.ageMonths <= dogAgeMonths).length
  const requiredForAge = vaccines.filter((v) => v.ageMonths <= dogAgeMonths).length
  const upcomingVaccines = vaccines.filter((v) => v.ageMonths > dogAgeMonths && v.ageMonths <= dogAgeMonths + 6)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Carteira de Vacinação</DialogTitle>
          <p className="text-sm text-muted-foreground">Acompanhe as vacinas do seu pet</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Selecionar Cachorro</Label>
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um cachorro" />
              </SelectTrigger>
              <SelectContent>
                {dogs.length > 0 ? (
                  dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhum cachorro cadastrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Vaccination Status */}
          {selectedDog && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm">Status de Vacinação</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedDog.name} - {dogAgeDisplay}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {completedCount}/{requiredForAge}
                  </div>
                  <p className="text-xs text-muted-foreground">Completas</p>
                </div>
              </div>

              {completedCount === requiredForAge ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Todas as vacinas em dia!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Existem vacinas pendentes para a idade atual</span>
                </div>
              )}
            </Card>
          )}

          {/* Upcoming Vaccines */}
          {selectedDog && upcomingVaccines.length > 0 && (
            <Card className="p-4 bg-accent/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Próximas Vacinas</h4>
              </div>
              <ul className="space-y-1">
                {upcomingVaccines.map((vaccine, index) => (
                  <li key={index} className="text-xs flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>{vaccine.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {vaccine.ageMonths} meses
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Vaccine Checklist */}
          {selectedDog && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Calendário de Vacinação</h4>
              {vaccines.map((vaccine, index) => {
                const isOverdue = vaccine.ageMonths <= dogAgeMonths && !vaccine.checked
                const isUpcoming = vaccine.ageMonths > dogAgeMonths

                return (
                  <Card key={index} className={`p-4 ${isOverdue ? "border-yellow-500/50 bg-yellow-500/5" : ""}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`vaccine-${index}`}
                        checked={vaccine.checked}
                        onCheckedChange={() => toggleVaccine(index)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`vaccine-${index}`}
                          className={`block font-medium text-sm cursor-pointer ${vaccine.checked ? "line-through text-muted-foreground" : ""}`}
                        >
                          {vaccine.name}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">{vaccine.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {vaccine.ageMonths} meses
                          </Badge>
                          {isOverdue && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                            >
                              Atrasada
                            </Badge>
                          )}
                          {isUpcoming && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            >
                              Futura
                            </Badge>
                          )}
                          {vaccine.checked && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                            >
                              ✓ Aplicada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Important Info */}
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <h4 className="font-semibold text-sm mb-2 text-destructive">Informações Importantes</h4>
            <ul className="space-y-1 text-xs">
              <li>• Mantenha sempre a carteira de vacinação atualizada</li>
              <li>• Respeite os intervalos entre doses recomendados pelo veterinário</li>
              <li>• A vacina antirrábica é obrigatória por lei</li>
              <li>• Filhotes não devem sair de casa antes de completar o protocolo</li>
              <li>• Observe o cachorro após vacinação (reações são raras)</li>
              <li>• Reforços anuais são essenciais para manter a imunidade</li>
            </ul>
          </Card>

          {/* CTA Button */}
          <Button className="w-full" variant="default">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Consulta Veterinária
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
