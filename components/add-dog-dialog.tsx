"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface AddDogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddDog: (dog: { name: string; birthDate: string; breed?: string; gender: string; weight: string }) => Promise<void>
}

export function AddDogDialog({ open, onOpenChange, onAddDog }: AddDogDialogProps) {
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("Macho")
  const [weight, setWeight] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name && birthDate && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onAddDog({
          name,
          birthDate,
          breed: "Não especificado", // Using default breed value
          gender,
          weight: weight || "0",
        })
        setName("")
        setBirthDate("")
        setGender("Macho")
        setWeight("")
        onOpenChange(false)
      } catch (error) {
        console.error("[v0] Error in form submission:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">{t("addDog")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="dog-name" className="text-sm sm:text-base font-medium">
              {t("dogName")}
            </Label>
            <Input
              id="dog-name"
              placeholder="Ex: Luna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 sm:h-12 text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-date" className="text-sm sm:text-base font-medium">
              {t("birthDate")}
            </Label>
            <div className="relative">
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dog-gender" className="text-sm sm:text-base font-medium">
              Sexo
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-10 sm:h-12">
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Fêmea">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dog-weight" className="text-sm sm:text-base font-medium">
              Peso (kg) - Opcional
            </Label>
            <Input
              id="dog-weight"
              type="number"
              step="0.1"
              placeholder="Ex: 5.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 sm:h-12"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 sm:h-12 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
