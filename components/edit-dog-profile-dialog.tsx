"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDogs } from "@/lib/hooks/use-supabase-data"
import { toast } from "react-toastify"
import confetti from "canvas-confetti"

interface EditDogProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dogId?: string
}

export function EditDogProfileDialog({ open, onOpenChange, dogId }: EditDogProfileDialogProps) {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("male")
  const [weight, setWeight] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { dogs, updateDog } = useDogs()

  useEffect(() => {
    if (open && dogId) {
      const dog = dogs.find((d) => d.id === dogId)
      if (dog) {
        console.log("[v0] Loading dog data for editing:", dog.name)
        setName(dog.name || "")
        setBreed(dog.breed || "")
        setBirthDate(dog.birthDate || "")
        setGender(dog.gender || "male")
        setWeight(dog.weight || "")
      }
    }
  }, [open, dogId, dogs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dogId) {
      toast.error("Erro ao identificar o cachorro")
      return
    }

    console.log("[v0] Saving dog profile:", { dogId, name, breed, birthDate, gender, weight })
    setIsLoading(true)

    try {
      await updateDog(dogId, {
        name,
        breed,
        birthDate,
        gender,
        weight,
      })

      console.log("[v0] Dog profile saved successfully")

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
      })

      toast.success(`Perfil de ${name} atualizado com sucesso!`)
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving dog profile:", error)
      toast.error("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Pet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dog-name">Nome do pet</Label>
            <Input
              id="dog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do seu pet"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Raça</Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Raça do seu pet"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth-date">Data de nascimento</Label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="6.0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select value={gender} onValueChange={setGender} disabled={isLoading}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Macho</SelectItem>
                <SelectItem value="female">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDogProfileDialog
