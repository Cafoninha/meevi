"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Calendar, Sparkles, Trophy, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDogs, useVaccines, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import confetti from "canvas-confetti"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HealthSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VACCINE_SCHEDULE = [
  {
    name: "V8 ou V10 (Primeira dose)",
    ageMonths: 2,
    description: "Proteção contra cinomose, parvovirose, hepatite, leptospirose, adenovírus, parainfluenza",
  },
  {
    name: "V8 ou V10 (Segunda dose)",
    ageMonths: 3,
    description: "Reforço da primeira dose para garantir imunização completa",
  },
  {
    name: "V8 ou V10 (Terceira dose)",
    ageMonths: 4,
    description: "Reforço final do protocolo inicial de vacinação",
  },
  {
    name: "Raiva (Primeira dose)",
    ageMonths: 4,
    description: "Proteção contra raiva - obrigatória por lei no Brasil",
  },
  {
    name: "V8 ou V10 (Reforço anual)",
    ageMonths: 16,
    description: "Reforço anual da polivalente - manutenção da imunidade",
  },
  {
    name: "Raiva (Reforço anual)",
    ageMonths: 16,
    description: "Reforço anual da vacina antirrábica",
  },
  {
    name: "V8 ou V10 (Reforço - 2 anos)",
    ageMonths: 28,
    description: "Reforço anual da polivalente no segundo ano",
  },
  {
    name: "Raiva (Reforço - 2 anos)",
    ageMonths: 28,
    description: "Reforço anual da raiva no segundo ano",
  },
  {
    name: "Giardíase (Opcional)",
    ageMonths: 2,
    description: "Proteção contra giárdia - recomendada para filhotes",
  },
  {
    name: "Gripe Canina (Opcional)",
    ageMonths: 3,
    description: "Tosse dos canis - importante para cães que frequentam creches",
  },
]

export function HealthSection({ open, onOpenChange }: HealthSectionProps) {
  const [selectedDogId, setSelectedDogId] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()
  const { dogs } = useDogs()
  const { records: vaccineRecords, addRecord, deleteRecord } = useVaccines()
  const { addEntry } = useDiaryEntries()

  useEffect(() => {
    const savedDogSelection = localStorage.getItem("meevi_health_selected_dog")
    if (savedDogSelection && dogs.some((d) => d.id === savedDogSelection)) {
      setSelectedDogId(savedDogSelection)
    } else if (dogs.length > 0) {
      setSelectedDogId(dogs[0].id)
    }
  }, [dogs])

  useEffect(() => {
    if (selectedDogId) {
      localStorage.setItem("meevi_health_selected_dog", selectedDogId)
    }
  }, [selectedDogId])

  const selectedDog = dogs.find((d) => d.id === selectedDogId)

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

  const dogAgeMonths = selectedDog ? calculateAgeInMonths(selectedDog.birthDate) : 0
  const dogAgeDisplay = selectedDog ? calculateAgeDisplay(selectedDog.birthDate) : "idade desconhecida"

  const dogVaccineRecords = vaccineRecords.filter((r) => r.dog_id === selectedDogId)

  const isVaccineCompleted = (vaccineName: string) => {
    return dogVaccineRecords.some((r) => r.vaccine_name === vaccineName && r.status === "completed")
  }

  const completedCount = VACCINE_SCHEDULE.filter(
    (v) => v.ageMonths <= dogAgeMonths && isVaccineCompleted(v.name),
  ).length
  const requiredForAge = VACCINE_SCHEDULE.filter((v) => v.ageMonths <= dogAgeMonths).length
  const upcomingVaccines = VACCINE_SCHEDULE.filter((v) => v.ageMonths > dogAgeMonths && v.ageMonths <= dogAgeMonths + 6)

  const today = new Date().toISOString().split("T")[0]
  const todayVaccineCount = dogVaccineRecords.filter((r) => r.date === today).length

  const toggleVaccine = async (vaccine: (typeof VACCINE_SCHEDULE)[0]) => {
    if (!selectedDogId) {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro recebeu a vacina",
        variant: "destructive",
      })
      return
    }

    const isCompleted = isVaccineCompleted(vaccine.name)

    if (isCompleted) {
      // Remove vaccine
      const recordToDelete = dogVaccineRecords.find((r) => r.vaccine_name === vaccine.name)
      if (recordToDelete) {
        await deleteRecord(recordToDelete.id)
        toast({
          title: "Vacina removida",
          description: `${vaccine.name} foi desmarcada`,
        })
      }
    } else {
      // Add vaccine
      const now = new Date()
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      const dateString = now.toISOString().split("T")[0]

      // Add to vaccine_status table
      await addRecord({
        dog_id: selectedDogId,
        vaccine_name: vaccine.name,
        date: dateString,
        status: "completed",
        notes: vaccine.description,
      })

      // Add to diary
      await addEntry({
        dogId: selectedDogId,
        dogName: selectedDog?.name || "Cachorro",
        type: "health",
        title: `Vacina: ${vaccine.name}`,
        notes: vaccine.description,
        date: dateString,
        time: timeString,
      })

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4ade80", "#22c55e", "#16a34a"],
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      toast({
        title: "Vacina registrada!",
        description: `${selectedDog?.name} recebeu: ${vaccine.name}`,
      })

      console.log("[v0] Vaccine registered successfully")
    }
  }

  const handleDeleteVaccine = async (recordId: string, vaccineName: string) => {
    await deleteRecord(recordId)
    toast({
      title: "Registro removido",
      description: `${vaccineName} foi removido do histórico`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Carteira de Vacinação
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Acompanhe as vacinas do seu Spitz Alemão</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Selecionar Cachorro</Label>
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um cachorro" />
              </SelectTrigger>
              <SelectContent>
                {dogs.length > 1 && <SelectItem value="all">Todos os cachorros</SelectItem>}
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
            <p className="text-xs text-muted-foreground">
              {selectedDogId === "all"
                ? "Visualizar vacinas de todos os cachorros"
                : "Selecione o cachorro para gerenciar vacinas"}
            </p>
          </div>

          {todayVaccineCount >= 1 && (
            <Card className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 animate-in slide-in-from-top">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-sm">
                    {todayVaccineCount} {todayVaccineCount === 1 ? "vacina aplicada" : "vacinas aplicadas"} hoje!
                  </p>
                  <p className="text-xs text-muted-foreground">Continue mantendo a saúde do seu pet em dia</p>
                </div>
              </div>
            </Card>
          )}

          {/* Vaccination Status */}
          {selectedDogId !== "all" && selectedDog && (
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

              {completedCount === requiredForAge && requiredForAge > 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Todas as vacinas em dia!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {requiredForAge - completedCount}{" "}
                    {requiredForAge - completedCount === 1 ? "vacina pendente" : "vacinas pendentes"} para a idade atual
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Upcoming Vaccines */}
          {selectedDogId !== "all" && selectedDog && upcomingVaccines.length > 0 && (
            <Card className="p-4 bg-accent/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Próximas Vacinas (6 meses)</h4>
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
          {selectedDogId !== "all" && selectedDog && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Calendário de Vacinação para Spitz Alemão</h4>
              {VACCINE_SCHEDULE.map((vaccine, index) => {
                const isCompleted = isVaccineCompleted(vaccine.name)
                const isOverdue = vaccine.ageMonths <= dogAgeMonths && !isCompleted
                const isUpcoming = vaccine.ageMonths > dogAgeMonths

                return (
                  <Card
                    key={index}
                    className={`p-4 transition-all ${
                      isOverdue ? "border-yellow-500/50 bg-yellow-500/5" : ""
                    } ${isCompleted ? "opacity-75" : ""} ${showSuccess && isCompleted ? "animate-in slide-in-from-left" : ""}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`vaccine-${index}`}
                        checked={isCompleted}
                        onCheckedChange={() => toggleVaccine(vaccine)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`vaccine-${index}`}
                          className={`block font-medium text-sm cursor-pointer ${isCompleted ? "line-through text-muted-foreground" : ""}`}
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
                          {isCompleted && (
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

          {selectedDogId !== "all" && selectedDog && dogVaccineRecords.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Histórico de Vacinações</h4>
              {dogVaccineRecords.map((record, index) => (
                <Card
                  key={record.id}
                  className="p-3 hover:shadow-md transition-all animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{record.vaccine_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(record.date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteVaccine(record.id, record.vaccine_name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Important Info for German Spitz */}
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <h4 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Guia de Vacinação para Spitz Alemão
            </h4>
            <ul className="space-y-1 text-xs">
              <li>• O Spitz Alemão é sensível - sempre observe reações após vacinação</li>
              <li>• Mantenha a carteira de vacinação atualizada para passeios seguros</li>
              <li>• A vacina V8 ou V10 protege contra as principais doenças virais</li>
              <li>• A antirrábica é obrigatória por lei e deve ser repetida anualmente</li>
              <li>• Filhotes: aguarde 15 dias após última dose antes de socializar</li>
              <li>• Spitz são ativos - a vacina de gripe canina é recomendada</li>
              <li>• Consulte seu veterinário sobre vacinas opcionais (giárdia, leishmaniose)</li>
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

export default HealthSection
