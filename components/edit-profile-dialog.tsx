"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerId: string | null
  onProfileUpdate: () => void
}

export function EditProfileDialog({ open, onOpenChange, ownerId, onProfileUpdate }: EditProfileDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && ownerId) {
      loadOwnerData()
    }
  }, [open, ownerId])

  const loadOwnerData = () => {
    if (!ownerId) return

    try {
      const ownerData = localStorage.getItem("owner")
      if (ownerData) {
        const data = JSON.parse(ownerData)
        setName(data.name || "")
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setLocation(data.location || "")
      }
    } catch (error) {
      console.error("Error loading owner data:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ownerId) return

    setIsLoading(true)

    try {
      const ownerData = localStorage.getItem("owner")
      const currentOwner = ownerData ? JSON.parse(ownerData) : {}

      const updatedOwner = {
        ...currentOwner,
        name,
        email,
        phone,
        location,
      }

      localStorage.setItem("owner", JSON.stringify(updatedOwner))

      alert("Perfil atualizado com sucesso!")
      onProfileUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Cidade, Estado"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
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
