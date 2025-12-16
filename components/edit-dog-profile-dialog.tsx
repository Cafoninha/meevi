"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditDogProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dogId?: string
  onSave?: () => void
}

export function EditDogProfileDialog({ open, onOpenChange, dogId, onSave }: EditDogProfileDialogProps) {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("male")
  const [weight, setWeight] = useState("")
  const [currentDog, setCurrentDog] = useState<any>(null)

  useEffect(() => {
    if (open) {
      loadDogData()
    }
  }, [open, dogId])

  const loadDogData = () => {
    try {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        const dogs = JSON.parse(storedDogs)
        // Use dogId if provided, otherwise use first dog
        const dog = dogId ? dogs.find((d: any) => d.id === dogId) : dogs[0]

        if (dog) {
          setCurrentDog(dog)
          setName(dog.name || "")
          setBreed(dog.breed || "")
          setBirthDate(dog.birthDate || "")
          setGender(dog.gender || "male")
          setWeight(dog.weight || "")
        }
      }
    } catch (error) {
      console.error("Error loading dog data:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentDog) {
      alert("Erro ao carregar dados do cachorro")
      return
    }

    try {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        const dogs = JSON.parse(storedDogs)
        const updatedDogs = dogs.map((dog: any) =>
          dog.id === currentDog.id ? { ...dog, name, breed, birthDate, gender, weight } : dog,
        )

        localStorage.setItem("dogs", JSON.stringify(updatedDogs))

        // Call onSave callback to refresh parent component
        if (onSave) {
          onSave()
        }

        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error saving dog data:", error)
      alert("Erro ao salvar dados. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pet</DialogTitle>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select value={gender} onValueChange={setGender}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
