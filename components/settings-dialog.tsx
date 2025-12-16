"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { User, Mail, LogOut, Save } from "lucide-react"

interface Owner {
  id: string
  name: string
  age?: number | null
  gender?: "masculino" | "feminino" | null
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  owner: Owner | null
  onOwnerUpdate: () => void
}

export function SettingsDialog({ open, onOpenChange, owner, onOwnerUpdate }: SettingsDialogProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"masculino" | "feminino" | "">("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (owner) {
      setName(owner.name || "")
      setAge(owner.age?.toString() || "")
      setGender(owner.gender || "")
    }
  }, [owner])

  const handleSave = () => {
    if (!owner?.id) return

    setIsSaving(true)

    try {
      const updatedOwner = {
        ...owner,
        name,
        age: age ? Number.parseInt(age) : null,
        gender: gender || null,
      }

      localStorage.setItem("owner", JSON.stringify(updatedOwner))

      alert("Configurações salvas com sucesso!")
      onOwnerUpdate()
    } catch (err) {
      console.error("[v0] Error updating owner:", err)
      alert("Erro ao salvar configurações")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair da sua conta?")) {
      localStorage.removeItem("ownerId")
      localStorage.removeItem("owner")
      localStorage.removeItem("dogs")
      localStorage.removeItem("onboardingComplete")
      localStorage.removeItem("calendarEvents")
      window.location.href = "/"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Configuration */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Configuração do Usuário</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Sua idade"
                  min="1"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={gender === "masculino" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGender("masculino")}
                  >
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    variant={gender === "feminino" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGender("feminino")}
                  >
                    Feminino
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Suporte</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda? Entre em contato conosco:</p>
            <a href="mailto:dmndkennel@gmail.com" className="text-sm font-medium text-primary hover:underline">
              dmndkennel@gmail.com
            </a>
          </Card>

          {/* Logout */}
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
