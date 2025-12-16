"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplet, Thermometer, Wind, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BathSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Dog {
  id: string
  name: string
  birth_date: string
  breed: string
}

interface LastBathData {
  date: string
  dogName: string
}

export function BathSection({ open, onOpenChange }: BathSectionProps) {
  const [lastBath, setLastBath] = useState<LastBathData | null>(null)
  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const dogsData = localStorage.getItem("dogs")
      if (dogsData) {
        const parsedDogs = JSON.parse(dogsData)
        setDogs(parsedDogs)
        const savedDogSelection = localStorage.getItem("meevi_bath_selected_dog")
        if (savedDogSelection) {
          setSelectedDogId(savedDogSelection)
        } else if (parsedDogs.length > 0) {
          setSelectedDogId("all")
        }
      }

      const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")
      const lastBathEntry = diaryEntries.find((entry: any) => entry.type === "bath")
      if (lastBathEntry) {
        setLastBath({
          date: lastBathEntry.date,
          dogName: lastBathEntry.dogName || "Todos os cachorros",
        })
      }
    }
  }, [open])

  useEffect(() => {
    if (selectedDogId) {
      localStorage.setItem("meevi_bath_selected_dog", selectedDogId)
    }
  }, [selectedDogId])

  const handleBathComplete = () => {
    if (!selectedDogId) {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro tomou banho.",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const dateString = now.toISOString().split("T")[0]

    const diaryEntries = JSON.parse(localStorage.getItem("meevi_diary_entries") || "[]")

    if (selectedDogId === "all") {
      dogs.forEach((dog) => {
        diaryEntries.unshift({
          id: `${Date.now()}-${dog.id}`,
          type: "bath",
          title: "Banho Completo",
          description: "Banho seguindo guia completo do Meevi",
          time: timeString,
          date: dateString,
          dogId: dog.id,
          dogName: dog.name,
        })
      })
      setLastBath({
        date: dateString,
        dogName: "Todos os cachorros",
      })
      toast({
        title: "Banho registrado!",
        description: `Banho registrado para todos os cachorros.`,
      })
    } else {
      const selectedDog = dogs.find((d) => d.id === selectedDogId)
      diaryEntries.unshift({
        id: Date.now().toString(),
        type: "bath",
        title: "Banho Completo",
        description: "Banho seguindo guia completo do Meevi",
        time: timeString,
        date: dateString,
        dogId: selectedDogId,
        dogName: selectedDog?.name,
      })
      setLastBath({
        date: dateString,
        dogName: selectedDog?.name || "",
      })
      toast({
        title: "Banho registrado!",
        description: `Banho registrado para ${selectedDog?.name}.`,
      })
    }

    localStorage.setItem("meevi_diary_entries", JSON.stringify(diaryEntries))
  }

  const bathSteps = [
    {
      step: 1,
      title: "Preparação",
      icon: Sparkles,
      description: "Antes de começar",
      tips: [
        "Escove bem o pelo para remover nós e pelos soltos",
        "Separe todos os produtos: shampoo específico para Spitz, condicionador, toalhas",
        "Prepare o ambiente: água morna, local sem correntes de ar",
        "Use tapete antiderrapante na banheira ou box",
      ],
    },
    {
      step: 2,
      title: "Temperatura da Água",
      icon: Thermometer,
      description: "Água morna é essencial",
      tips: [
        "Use água morna (não quente nem fria)",
        "Teste a temperatura com o pulso antes de molhar o cachorro",
        "A água deve estar confortável, entre 37-39°C",
        "Evite água muito quente que pode ressecar a pele",
      ],
    },
    {
      step: 3,
      title: "Molhando e Lavando",
      icon: Droplet,
      description: "Técnica correta de lavagem",
      tips: [
        "Comece molhando o corpo, deixando a cabeça por último",
        "Aplique shampoo específico para Spitz de pelo duplo",
        "Massageie suavemente em movimentos circulares",
        "Evite que entre água e shampoo nos olhos e ouvidos",
        "Enxágue completamente até remover todo o produto",
      ],
    },
    {
      step: 4,
      title: "Secagem",
      icon: Wind,
      description: "Secar corretamente é crucial",
      tips: [
        "Remova o excesso de água com toalha macia",
        "Use secador em temperatura morna/fria",
        "Mantenha o secador a 20-30cm de distância",
        "Escove enquanto seca para evitar nós",
        "Seque completamente para evitar fungos",
        "Nunca deixe secar naturalmente - pode causar problemas de pele",
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Guia Completo de Banho</DialogTitle>
          <p className="text-sm text-muted-foreground">Como dar banho corretamente no seu Spitz Alemão</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecione o cachorro</label>
              <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                <SelectTrigger className="w-full">
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
            </div>
          </Card>

          {lastBath && (
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Último banho registrado</p>
                  <p className="text-xs text-muted-foreground">{new Date(lastBath.date).toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">{lastBath.dogName}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Frequência Recomendada</h4>
                <p className="text-xs text-muted-foreground">
                  Spitz Alemão deve tomar banho a cada 15-30 dias. Banhos frequentes demais podem remover a oleosidade
                  natural do pelo.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {bathSteps.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.step} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Passo {item.step}
                        </Badge>
                        <h4 className="font-semibold">{item.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <ul className="space-y-1.5">
                        {item.tips.map((tip, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <h4 className="font-semibold text-sm mb-2 text-destructive">Cuidados Importantes</h4>
            <ul className="space-y-1 text-xs">
              <li>• Nunca use shampoo humano - o pH é diferente</li>
              <li>• Não deixe o pelo secar naturalmente</li>
              <li>• Evite banhos em dias muito frios</li>
              <li>• Não dê banho se o cachorro estiver doente</li>
              <li>• Proteja os ouvidos da água com algodão</li>
            </ul>
          </Card>

          <Button onClick={handleBathComplete} className="w-full" size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Registrar Banho Concluído
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
