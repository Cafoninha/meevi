"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplet, Thermometer, Wind, Sparkles, AlertCircle, CheckCircle2, Trash2, Check, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDogs, useBath, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import { format } from "date-fns"
import confetti from "canvas-confetti"

interface BathSectionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BathSection({ open, onOpenChange }: BathSectionProps) {
  const [selectedDogId, setSelectedDogId] = useState<string>("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newRecordId, setNewRecordId] = useState<string | null>(null)
  const { toast } = useToast()

  const { dogs, loading: dogsLoading } = useDogs()
  const { records, loading: recordsLoading, addRecord, deleteRecord } = useBath()
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
        colors: ["#60a5fa", "#93c5fd", "#bfdbfe"],
      })
      setNewRecordId(null)
    }
  }, [records, newRecordId])

  const handleBathComplete = async () => {
    if (!selectedDogId || selectedDogId === "") {
      toast({
        title: "Selecione um cachorro",
        description: "Por favor, selecione qual cachorro tomou banho.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setShowSuccess(false)

    try {
      const now = new Date()
      const dogsToBath = selectedDogId === "all" ? dogs : dogs.filter((d) => d.id === selectedDogId)

      console.log("[v0] Registering bath for dogs:", dogsToBath.map((d) => d.name).join(", "))

      for (const dog of dogsToBath) {
        const newRecord = await addRecord({
          dog_id: dog.id,
          bath_time: now.toISOString(),
          notes: "Banho seguindo guia completo do Meevi",
        })

        if (newRecord && dogsToBath.length === 1) {
          setNewRecordId(newRecord.id)
        }

        await addDiaryEntry({
          dogId: dog.id,
          dogName: dog.name,
          type: "bath",
          title: "Banho Completo",
          notes: "Banho seguindo guia completo do Meevi",
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
        })
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      const dogNames = dogsToBath.map((d) => d.name).join(", ")
      toast({
        title: "🎉 Banho registrado!",
        description: `${dogNames} ${dogsToBath.length > 1 ? "tomaram" : "tomou"} banho às ${format(now, "HH:mm")}`,
      })

      console.log("[v0] Bath record(s) added successfully!")
    } catch (error) {
      console.error("[v0] Error registering bath:", error)
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível registrar o banho. Tente novamente.",
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
        description: "Registro de banho excluído com sucesso.",
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

  const getTimeAgo = (bathTime: string) => {
    const now = new Date()
    const bath = new Date(bathTime)
    const diffMs = now.getTime() - bath.getTime()
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

  const todayBaths = records.filter((r) => {
    const recordDate = format(new Date(r.bath_time), "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")
    return recordDate === today
  }).length

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
          <DialogTitle className="text-xl flex items-center gap-2">
            Guia Completo de Banho
            {todayBaths >= 1 && (
              <span className="flex items-center gap-1 text-sm font-normal text-primary">
                <Trophy className="w-4 h-4" />
                {todayBaths} banho{todayBaths > 1 ? "s" : ""} hoje!
              </span>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Como dar banho corretamente no seu Spitz Alemão</p>
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
                  ? "Registrar banho para todos os cachorros"
                  : "Selecione qual cachorro tomou banho"}
              </p>
            </div>
          </Card>

          {/* Bath History */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Histórico de Banhos</h4>
                {records.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {records.length} registro{records.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {recordsLoading ? (
                <p className="text-center text-sm text-muted-foreground py-2">Carregando histórico...</p>
              ) : Object.keys(groupedRecords).length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-2">Nenhum banho registrado ainda</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedRecords).map(([dogName, dogRecords]) => (
                    <div key={dogName} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm font-semibold text-primary">{dogName}</p>
                      </div>
                      {dogRecords
                        .sort((a, b) => new Date(b.bath_time).getTime() - new Date(a.bath_time).getTime())
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
                                  <Droplet className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-sm font-bold text-foreground">
                                    {format(new Date(record.bath_time), "HH:mm")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{getTimeAgo(record.bath_time)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground pl-5">
                                  {format(new Date(record.bath_time), "dd/MM/yyyy")}
                                </p>
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

          {/* Frequency Recommendation */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Frequência Recomendada</h4>
                <p className="text-xs text-muted-foreground">
                  Spitz Alemão deve tomar banho a cada 15-30 dias. Banhos frequentes demais podem remover a oleosidade
                  natural do pelo.
                </p>
              </div>
            </div>
          </Card>

          {/* Bath Steps Guide */}
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

          {/* Important Care */}
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

          {/* Register Button */}
          <Button
            onClick={handleBathComplete}
            className="w-full relative overflow-hidden"
            size="lg"
            variant={showSuccess ? "default" : "default"}
            disabled={isSubmitting || !selectedDogId}
          >
            {showSuccess ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Registrado!
                <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {isSubmitting ? "Registrando..." : "Registrar Banho Concluído"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BathSection
