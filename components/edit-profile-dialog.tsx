"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOwnerProfile } from "@/lib/hooks/use-supabase-data"
import { useAuth } from "@/lib/auth-context" // Import useAuth to get user.id
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { profile, updateProfile } = useOwnerProfile()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open && profile) {
      console.log("[v0] Loading profile data into form:", profile)
      setName(profile.name || "")
      setEmail(profile.email || "")
      setPhone(profile.phone || "")
      setLocation(profile.location || "")
    }
  }, [open, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Save button clicked - submitting profile update")

    if (!user?.id) {
      console.error("[v0] No user ID found in auth context")
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log("[v0] Updating profile with data:", { userId: user.id, name, email, phone, location })

    try {
      await updateProfile({
        name,
        email,
        phone,
        location,
      })

      console.log("[v0] Profile updated successfully")

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#06b6d4", "#10b981"],
      })

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      })
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
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
