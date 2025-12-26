"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInstalled = localStorage.getItem("meevi_pwa_installed")

    if (isStandalone || isInstalled === "true") {
      return
    }

    // Listener para evento de instalação PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Mostrar prompt após 10 segundos
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 10000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Detectar quando o app foi instalado
    window.addEventListener("appinstalled", () => {
      console.log("[Meevi] PWA instalado com sucesso!")
      localStorage.setItem("meevi_pwa_installed", "true")
      setShowInstallPrompt(false)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log(`[Meevi] Usuário ${outcome === "accepted" ? "aceitou" : "recusou"} a instalação`)

    if (outcome === "accepted") {
      localStorage.setItem("meevi_pwa_installed", "true")
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Mostrar novamente em 7 dias
    const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem("meevi_install_prompt_dismissed", dismissUntil.toString())
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Instalar Meevi</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Adicione o Meevi na tela inicial para acesso rápido e experiência completa!
            </p>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstallClick} className="flex-1">
                Instalar App
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Depois
              </Button>
            </div>
          </div>

          <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
