"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Target, Zap, Brain, CheckCircle2, Trash2, Check, Trophy, Sparkles, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDogs, useExercise, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import { format } from "date-fns"
import confetti from "canvas-confetti"

interface ExerciseSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExerciseSection({ open, onOpenChange }: ExerciseSectionProps) {
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newRecordId, setNewRecordId] = useState<string | null>(null)
  const { toast } = useToast()

  const { dogs, loading: dogsLoading } = useDogs()
  const { records, loading: recordsLoading, addRecord, deleteRecord } = useExercise()
  const { addEntry: addDiaryEntry } = useDiaryEntries()

  useEffect(() => {
    if (dogs.length > 0 && !selectedDogId) {
      setSelectedDogId("all")
    }
  }, [dogs])

  useEffect(() => {
    if (newRecordId && records.some((r) => r.id === newRecordId)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#fdba74"],
      })
      setNewRecordId(null)
    }
  }, [records, newRecordId])

  const handleExerciseComplete = async (exerciseTitle: string, duration: string) => {
    if (!selectedDogId || selectedDogId === "") {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro fez o exercício.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      const now = new Date()
      const dogsToExercise = selectedDogId === "all" ? dogs : dogs.filter((d) => d.id === selectedDogId)

      console.log("[v0] Registering exercise for dogs:", dogsToExercise.map((d) => d.name).join(", "))

      for (const dog of dogsToExercise) {
        const newRecord = await addRecord({
          dog_id: dog.id,
          exercise_type: exerciseTitle,
          duration: duration,
          exercise_time: now.toISOString(),
          notes: `${exerciseTitle} concluído`,
        })

        if (newRecord && dogsToExercise.length === 1) {
          setNewRecordId(newRecord.id)
        }

        await addDiaryEntry({
          dogId: dog.id,
          dogName: dog.name,
          type: "exercise",
          title: exerciseTitle,
          notes: `Duração: ${duration}`,
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
        })
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      const dogNames = dogsToExercise.map((d) => d.name).join(", ")
      toast({
        title: "🎉 Exercício registrado!",
        description: `${exerciseTitle} registrado para ${dogNames} às ${format(now, "HH:mm")}`,
      })

      console.log("[v0] Exercise record(s) added successfully!")
    } catch (error) {
      console.error("[v0] Error registering exercise:", error)
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar o exercício. Tente novamente.",
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
        description: "Registro de exercício excluído com sucesso.",
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

  const getTimeAgo = (exerciseTime: string) => {
    const now = new Date()
    const exercise = new Date(exerciseTime)
    const diffMs = now.getTime() - exercise.getTime()
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

  const todayExercises = records.filter((r) => {
    const recordDate = format(new Date(r.exercise_time), "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")
    return recordDate === today
  }).length

  const exercises = [
    {
      title: "Caminhada Diária",
      duration: "20-30 minutos",
      difficulty: "Fácil",
      icon: Target,
      description: "Essencial para saúde física e mental",
      instructions: [
        "Faça 2 caminhadas por dia (manhã e tarde)",
        "Use coleira confortável e guia curta",
        "Mantenha ritmo moderado",
        "Deixe o cachorro farejar e explorar",
        "Evite horários de sol forte",
      ],
      benefits: ["Saúde cardiovascular", "Socialização", "Controle de peso"],
    },
    {
      title: "Buscar e Trazer",
      duration: "10-15 minutos",
      difficulty: "Fácil",
      icon: Zap,
      description: "Exercício e diversão",
      instructions: [
        "Use uma bolinha ou brinquedo favorito",
        "Comece com distâncias curtas",
        "Recompense quando ele trouxer de volta",
        "Aumente gradualmente a distância",
        "Pratique em local seguro e fechado",
      ],
      benefits: ["Exercício físico", "Obediência", "Vínculo com dono"],
    },
    {
      title: "Treino de Obediência",
      duration: "10 minutos",
      difficulty: "Médio",
      icon: Brain,
      description: "Estimulação mental e disciplina",
      instructions: [
        "Senta: Segure petisco acima da cabeça, diga 'senta' e recompense",
        "Fica: Peça para sentar, dê comando 'fica', afaste-se e volte",
        "Deita: Com cachorro sentado, leve petisco ao chão",
        "Vem: Use guia longa, chame o nome e recompense quando vier",
        "Pratique 2-3 comandos por sessão, sempre com recompensas",
      ],
      benefits: ["Inteligência", "Obediência", "Concentração"],
    },
    {
      title: "Circuito de Obstáculos",
      duration: "15 minutos",
      difficulty: "Médio",
      icon: Target,
      description: "Agilidade e coordenação",
      instructions: [
        "Monte obstáculos simples em casa ou jardim",
        "Use almofadas, cones, túnel improvisado",
        "Guie o cachorro pelos obstáculos",
        "Recompense ao completar cada etapa",
        "Aumente dificuldade gradualmente",
      ],
      benefits: ["Agilidade", "Coordenação", "Confiança"],
    },
    {
      title: "Jogos de Faro",
      duration: "10 minutos",
      difficulty: "Fácil",
      icon: Brain,
      description: "Estimulação mental intensa",
      instructions: [
        "Esconda petiscos pela casa",
        "Comece com esconderijos fáceis",
        "Incentive o cachorro a farejar e procurar",
        "Aumente a dificuldade aos poucos",
        "Use caixas e tapetes de faro",
      ],
      benefits: ["Estimulação mental", "Instinto natural", "Cansaço mental"],
    },
    {
      title: "Brincadeira de Puxar",
      duration: "5-10 minutos",
      difficulty: "Fácil",
      icon: Zap,
      description: "Fortalecimento e diversão",
      instructions: [
        "Use brinquedo apropriado (corda)",
        "Deixe o cachorro ganhar às vezes",
        "Não puxe com muita força",
        "Ensine comando de 'solta'",
        "Pare se ficar agressivo demais",
      ],
      benefits: ["Força mandibular", "Vínculo", "Energia gasta"],
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Fácil") return "bg-green-500/10 text-green-700 dark:text-green-400"
    if (difficulty === "Médio") return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    return "bg-red-500/10 text-red-700 dark:text-red-400"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Treinos e Exercícios
            {todayExercises >= 2 && (
              <span className="flex items-center gap-1 text-sm font-normal text-primary">
                <Trophy className="w-4 h-4" />
                {todayExercises} exercício{todayExercises > 1 ? "s" : ""} hoje!
              </span>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Atividades físicas e mentais para seu Spitz Alemão</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dog Selection */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione o cachorro</label>
              <Select value={selectedDogId} onValueChange={setSelectedDogId} disabled={dogsLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={dogsLoading ? "Carregando..." : "Escolha um cachorro"} />
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
                  ? "Registrar exercício para todos os cachorros"
                  : "Selecione qual cachorro fez o exercício"}
              </p>
            </div>
          </Card>

          {/* Exercise History */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Histórico de Exercícios</h4>
                {records.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {records.length} registro{records.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {recordsLoading ? (
                <p className="text-center text-sm text-muted-foreground py-2">Carregando histórico...</p>
              ) : Object.keys(groupedRecords).length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-2">Nenhum exercício registrado ainda</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedRecords).map(([dogName, dogRecords]) => (
                    <div key={dogName} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm font-semibold text-primary">{dogName}</p>
                      </div>
                      {dogRecords
                        .sort((a, b) => new Date(b.exercise_time).getTime() - new Date(a.exercise_time).getTime())
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
                                  <Activity className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-sm font-bold text-foreground">
                                    {format(new Date(record.exercise_time), "HH:mm")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(record.exercise_time)}
                                  </span>
                                </div>
                                <p className="text-sm font-semibold pl-5">{record.exercise_type}</p>
                                <p className="text-xs text-muted-foreground pl-5">Duração: {record.duration}</p>
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
          </Card>

          {/* Daily Recommendation */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Recomendação Diária</h4>
                <p className="text-xs text-muted-foreground">
                  Spitz Alemão precisa de 30-60 minutos de atividade física por dia, divididos em 2-3 sessões. Combine
                  exercícios físicos com estimulação mental para um cachorro equilibrado e feliz.
                </p>
              </div>
            </div>
          </Card>

          {/* Exercise Cards */}
          <div className="space-y-3">
            {exercises.map((exercise, index) => {
              const Icon = exercise.icon
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold">{exercise.title}</h4>
                        <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                          {exercise.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {exercise.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>

                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-2">Como fazer:</p>
                        <ul className="space-y-1.5">
                          {exercise.instructions.map((instruction, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {exercise.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleExerciseComplete(exercise.title, exercise.duration)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isSubmitting || !selectedDogId}
                      >
                        {showSuccess ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Registrado!
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Concluir {exercise.title}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Important Tips */}
          <Card className="p-4 bg-accent/50">
            <h4 className="font-semibold text-sm mb-2">Dicas Importantes</h4>
            <ul className="space-y-1 text-xs">
              <li>• Sempre use reforço positivo (petiscos e elogios)</li>
              <li>• Mantenha sessões curtas para não cansar demais</li>
              <li>• Varie os exercícios para manter o interesse</li>
              <li>• Evite exercícios após refeições</li>
              <li>• Tenha sempre água disponível durante atividades</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ExerciseSection
