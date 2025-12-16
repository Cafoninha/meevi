"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { ChevronRight, Calendar, BookOpen, User, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useDogs } from "@/lib/hooks/use-supabase-data"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [dogName, setDogName] = useState("")
  const [dogBirthDate, setDogBirthDate] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { addDog, refetch } = useDogs()

  const saveToSupabase = async () => {
    if (isSaving) {
      console.log("[v0] Already saving, ignoring duplicate click")
      return
    }

    if (!user) {
      alert("Erro: Usuário não autenticado. Faça login novamente.")
      return
    }

    setIsSaving(true)
    setLoading(true)
    try {
      console.log("[v0] Saving onboarding data to Supabase for user:", user.email)

      await addDog({
        name: dogName,
        breed: "Spitz Alemão",
        birthDate: dogBirthDate,
        photo: "/placeholder.svg?height=200&width=200",
      })

      console.log("[v0] Dog saved to Supabase successfully")

      localStorage.setItem("ownerName", ownerName)
      localStorage.setItem("onboardingComplete", "true")

      await refetch()

      onComplete()
    } catch (error) {
      console.error("[v0] Error saving to Supabase:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao salvar dados: ${errorMessage}\n\nPor favor, tente novamente ou entre em contato com o suporte.`)
      setIsSaving(false)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      saveToSupabase()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-lg">
        {step === 0 && (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Image src="/meevi-logo-new.png" alt="Meevi Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Bem-vindo ao Meevi</h1>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
                O app completo para cuidar do seu Spitz Alemão com amor e organização
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
              <div className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-secondary/50 rounded-xl">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Diário</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-secondary/50 rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Calendário</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-secondary/50 rounded-xl">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Cuidados</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-secondary/50 rounded-xl">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Perfil</span>
              </div>
            </div>
            <Button onClick={nextStep} className="w-full" size="lg">
              Começar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-xl sm:text-2xl font-bold">Seu Melhor Amigo</h2>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                Vamos conhecer o seu Spitz Alemão
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dog-name" className="text-sm sm:text-base">
                  Nome do seu pet
                </Label>
                <Input
                  id="dog-name"
                  placeholder="Ex: Max"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dog-birth" className="text-sm sm:text-base">
                  Data de Nascimento
                </Label>
                <Input
                  id="dog-birth"
                  type="date"
                  value={dogBirthDate}
                  onChange={(e) => setDogBirthDate(e.target.value)}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button onClick={() => setStep(0)} variant="outline" className="flex-1" size="lg">
                Voltar
              </Button>
              <Button onClick={nextStep} disabled={!dogName || !dogBirthDate} className="flex-1" size="lg">
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-xl sm:text-2xl font-bold">E você?</h2>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">Como podemos te chamar?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name" className="text-sm sm:text-base">
                  Seu nome
                </Label>
                <Input
                  id="owner-name"
                  placeholder="Ex: Ana Silva"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1" size="lg">
                Voltar
              </Button>
              <Button onClick={nextStep} disabled={!ownerName} className="flex-1" size="lg">
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 sm:space-y-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Image
                src="/meevi-logo-new.png"
                alt="Meevi Logo"
                width={40}
                height={40}
                className="object-contain animate-pulse"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold">Tudo Pronto!</h2>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty leading-relaxed">
                {ownerName}, você e {dogName} estão prontos para começar uma jornada incrível de cuidados e amor.
              </p>
            </div>
            <Button onClick={nextStep} className="w-full" size="lg" disabled={loading || isSaving}>
              {loading ? "Salvando..." : "Entrar no Meevi"}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )}

        <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${i === step ? "w-6 sm:w-8 bg-primary" : "w-1.5 sm:w-2 bg-border"}`}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
