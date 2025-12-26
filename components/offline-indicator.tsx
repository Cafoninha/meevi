"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { Card } from "@/components/ui/card"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Mostrar "Conectado" por 3 segundos quando voltar online
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Definir status inicial
    setIsOnline(navigator.onLine)

    // Listeners para mudança de status
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <Card
        className={`px-4 py-2 shadow-lg flex items-center gap-2 ${
          isOnline ? "bg-green-50 border-green-200 text-green-800" : "bg-orange-50 border-orange-200 text-orange-800"
        }`}
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span className="text-sm font-medium">{isOnline ? "Conectado" : "Modo Offline"}</span>
      </Card>
    </div>
  )
}
