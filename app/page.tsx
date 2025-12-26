"use client"
import { useAuth } from "@/lib/auth-context"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { HomeScreen } from "@/components/home-screen"
import { AuthDialog } from "@/components/auth-dialog"
import { useDogs } from "@/lib/hooks/use-supabase-data"
import { useEffect, useState } from "react"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export default function Page() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { dogs, loading: dogsLoading } = useDogs()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !dogsLoading) {
      setShowOnboarding(dogs.length === 0)
    }
  }, [isAuthenticated, dogs, dogsLoading])

  if (authLoading || (isAuthenticated && dogsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm sm:text-base text-gray-600">
            {authLoading ? "Carregando..." : "Carregando seus dados..."}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthDialog open={true} onOpenChange={() => {}} />
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <>
      <HomeScreen />
      <PWAInstallPrompt />
    </>
  )
}
