"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Clock, Target, Zap, Brain, CheckCircle2 } from "lucide-react"

interface ExerciseSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Dog {
  id: string
  name: string
}

export function ExerciseSection({ open, onOpenChange }: ExerciseSectionProps) {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        const parsedDogs = JSON.parse(storedDogs)
        setDogs(parsedDogs)
        const savedDogSelection = localStorage.getItem("meevi_exercise_selected_dog")
        if (savedDogSelection) {
          setSelectedDogId(savedDogSelection)
        }
      }
    }
  }, [open])

  useEffect(() => {
    if (selectedDogId) {
      localStorage.setItem("meevi_exercise_selected_dog", selectedDogId)
    }
  }, [selectedDogId])

  const handleExerciseComplete = (exerciseTitle: string, duration: string) => {
    if (!selectedDogId || selectedDogId === "") {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro fez o exercício.",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const dateString = now.toISOString().split("T")[0]

    if (selectedDogId === "all") {
      const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")
      dogs.forEach((dog) => {
        diaryEntries.unshift({
          id: `${Date.now()}-${dog.id}`,
          type: "exercise",
          title: exerciseTitle,
          description: `Duração: ${duration}`,
          time: timeString,
          date: dateString,
          dogId: dog.id,
          dogName: dog.name,
        })
      })
      localStorage.setItem("meevi_diary_entries", JSON.stringify(diaryEntries))

      toast({
        title: "Exercício registrado!",
        description: `${exerciseTitle} registrado para todos os cachorros.`,
      })
    } else {
      const selectedDog = dogs.find((dog) => dog.id === selectedDogId)
      const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")
      diaryEntries.unshift({
        id: Date.now().toString(),
        type: "exercise",
        title: exerciseTitle,
        description: `Duração: ${duration}`,
        time: timeString,
        date: dateString,
        dogId: selectedDogId,
        dogName: selectedDog?.name,
      })
      localStorage.setItem("meevi_diary_entries", JSON.stringify(diaryEntries))

      toast({
        title: "Exercício registrado!",
        description: `${exerciseTitle} registrado para ${selectedDog?.name}.`,
      })
    }

    onOpenChange(false)
  }

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
      title: "Treino de Obediência Básica",
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
          <DialogTitle className="text-xl">Treinos e Exercícios</DialogTitle>
          <p className="text-sm text-muted-foreground">Atividades físicas e mentais para seu Spitz Alemão</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4">
            <label className="text-sm font-semibold mb-2 block">Selecione o cachorro:</label>
            <Select value={selectedDogId} onValueChange={setSelectedDogId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cachorro" />
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
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-semibold text-sm mb-2">Recomendação Diária</h4>
            <p className="text-xs text-muted-foreground">
              Spitz Alemão precisa de 30-60 minutos de atividade física por dia, divididos em 2-3 sessões. Combine
              exercícios físicos com estimulação mental para um cachorro equilibrado e feliz.
            </p>
          </Card>

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
                        className="w-full bg-transparent"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Concluir {exercise.title}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

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
