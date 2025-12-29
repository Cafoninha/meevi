"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { User, Mail, LogOut, Save } from "lucide-react"
import { useOwnerProfile } from "@/lib/hooks/use-supabase-data"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { profile, loading, updateProfile } = useOwnerProfile()
  const { signOut } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"masculino" | "feminino" | "">("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      console.log("[v0] Loading settings from profile:", profile)
      setName(profile.name || "")
      setAge(profile.age?.toString() || "")
      setGender((profile.gender as "masculino" | "feminino") || "")
    }
  }, [profile])

  const handleSave = async () => {
    console.log("[v0] Save settings button clicked")

    if (!profile?.id) {
      console.error("[v0] No profile ID available")
      toast({
        title: "Erro",
        description: "Perfil não encontrado",
        variant: "destructive",
      })
      return
    }

    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      console.log("[v0] Updating profile with:", { name, age, gender })

      await updateProfile({
        name: name.trim(),
        age: age ? Number.parseInt(age) : null,
        gender: gender || null,
      })

      console.log("[v0] Settings saved successfully")

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#60a5fa", "#3b82f6", "#2563eb"],
      })

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso",
      })

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 1000)
    } catch (err) {
      console.error("[v0] Error saving settings:", err)
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair da sua conta?")) {
      console.log("[v0] User logging out")
      await signOut()
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
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  disabled={loading}
                />
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
                  disabled={loading}
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
                    disabled={loading}
                  >
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    variant={gender === "feminino" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setGender("feminino")}
                    disabled={loading}
                  >
                    Feminino
                  </Button>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving || loading} className="w-full cursor-pointer">
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
            <a
              href="mailto:dmndkennel@gmail.com?subject=Suporte%20Meevi%20App"
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
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

export default SettingsDialog
