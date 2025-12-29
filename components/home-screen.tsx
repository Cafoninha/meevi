"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Heart, Activity, Droplets, Scale, Plus, Trash2, Bell } from "lucide-react"
import { AddDogDialog } from "@/components/add-dog-dialog"
import { useDogs, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import type { Dog } from "@/lib/hooks/use-supabase-data"
import { useLanguage } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import DiarySection from "@/components/diary-section"
import EssentialsSection from "@/components/essentials-section"
import CalendarSection from "@/components/calendar-section"
import StatisticsSection from "@/components/statistics-section"
import ProfileSection from "@/components/profile-section"
import SettingsDialog from "@/components/settings-dialog"
import FeedingSection from "@/components/feeding-section"
import BathSection from "@/components/bath-section"
import ExerciseSection from "@/components/exercise-section"
import HealthSection from "@/components/health-section"
import { toast } from "react-toastify"
import { NotificationsCenter } from "@/components/notifications-center"
import { useNotifications } from "@/lib/hooks/use-supabase-data"
import { OfflineIndicator } from "@/components/offline-indicator"
import EditDogProfileDialog from "@/components/edit-dog-profile-dialog"

type Tab = "home" | "diary" | "essentials" | "calendar" | "statistics" | "profile"

interface Owner {
  id: string
  name: string
  age?: number | null
  gender?: string | null
}

function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null)
  const [isAddingDog, setIsAddingDog] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [editingDogId, setEditingDogId] = useState<string | null>(null)
  const { dogs, loading: dogsLoading, addDog, updateDog, deleteDog } = useDogs()
  const { entries: diaryEntries } = useDiaryEntries()
  const { user } = useAuth()
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [dogToDelete, setDogToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [todayStats, setTodayStats] = useState({
    lastMeal: null as string | null,
    lastWalk: null as string | null,
    waterChanged: null as string | null,
  })
  const { t } = useLanguage()
  const { unreadCount } = useNotifications()
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>(dogs)
  const [currentDogIndex, setCurrentDogIndex] = useState(0)

  useEffect(() => {
    setFilteredDogs(dogs)
  }, [dogs])

  useEffect(() => {
    if (!diaryEntries || diaryEntries.length === 0) return

    const today = new Date().toISOString().split("T")[0]
    const todayEntries = diaryEntries.filter((entry) => entry.date === today)

    const lastMealEntry = todayEntries
      .filter((e) => e.type === "Alimentação")
      .sort((a, b) => b.time.localeCompare(a.time))[0]

    const lastWalkEntry = todayEntries
      .filter((e) => e.type === "Exercício")
      .sort((a, b) => b.time.localeCompare(a.time))[0]

    const waterEntry = todayEntries
      .filter((e) => e.type === "Outro" && e.title.toLowerCase().includes("água"))
      .sort((a, b) => b.time.localeCompare(a.time))[0]

    setTodayStats({
      lastMeal: lastMealEntry ? lastMealEntry.time : null,
      lastWalk: lastWalkEntry ? lastWalkEntry.time : null,
      waterChanged: waterEntry ? waterEntry.time : null,
    })
  }, [diaryEntries])

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        await fetch("/api/check-notifications", { method: "POST" })
      } catch (error) {
        console.error("[v0] Error checking notifications:", error)
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 15 * 60 * 1000) // Every 15 minutes

    return () => clearInterval(interval)
  }, [])

  const formatBirthDate = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A"
    const [year, month, day] = birthDate.split("-")
    return `${day}/${month}/${year}`
  }

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A"
    const [year, month, day] = birthDate.split("-")
    const birth = new Date(Number(year), Number(month) - 1, Number(day))
    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (years > 0) {
      return years === 1 ? "1 ano" : `${years} anos`
    }
    return months === 1 ? "1 mês" : `${months} meses`
  }

  const handleAddDog = async (dogData: {
    name: string
    birthDate: string
    breed: string
    gender: string
    weight: string
  }) => {
    try {
      await addDog({
        name: dogData.name,
        birthDate: dogData.birthDate,
        breed: dogData.breed,
        gender: dogData.gender,
        weight: dogData.weight,
        photo: "/placeholder.svg?height=200&width=200",
      })
      setIsAddingDog(false)
      setActiveTab("profile")
    } catch (error) {
      console.error("[v0] Error adding dog:", error)
      toast.error("Erro ao adicionar cachorro. Tente novamente.")
    }
  }

  const handleDeleteDog = async (dogId: string) => {
    console.log("[v0] handleDeleteDog called with id:", dogId)
    console.log("[v0] Current dogs count:", dogs.length)

    if (dogs.length === 1) {
      toast.error("Você precisa ter pelo menos um cachorro cadastrado!")
      return
    }

    setIsDeleting(true)
    try {
      console.log("[v0] Calling deleteDog...")
      await deleteDog(dogId)
      console.log("[v0] deleteDog completed successfully")

      if (dogs[selectedDogIndex]?.id === dogId) {
        setSelectedDogIndex(0)
      }

      setDogToDelete(null)
      console.log("[v0] Dog deletion process completed")
    } catch (error) {
      console.error("[v0] Error deleting dog:", error)
      toast.error("Erro ao deletar cachorro. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeleteDog = (dogId: string) => {
    setDogToDelete(dogId)
  }

  const handlePhotoUpload = async (file: File, dogId: string) => {
    console.log("[v0] Starting photo upload for dog:", dogId)
    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dogId", dogId)

      const response = await fetch("/api/upload-dog-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      console.log("[v0] Photo uploaded successfully:", data.url)

      // Update dog with new photo URL
      await updateDog(dogId, { photo: data.url })
      console.log("[v0] Dog updated with new photo")

      toast.success("Foto atualizada com sucesso!")
    } catch (error) {
      console.error("[v0] Error uploading photo:", error)
      toast.error("Erro ao fazer upload da foto. Tente novamente.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && currentDog) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      handlePhotoUpload(file, currentDog.id)
    }
  }

  if (dogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm sm:text-base text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const currentDog = dogs[selectedDogIndex]

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Header */}
      <header className="bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-primary">Meevi</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {user?.name ? `${t("welcome").split(" ")[0]}, ${user.name}` : t("welcome")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 relative"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold transition-all duration-300 animate-in fade-in zoom-in">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
              onClick={() => setIsSettingsOpen(true)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16">
        {activeTab === "home" && (
          <HomeTab
            onQuickAction={setActiveQuickAction}
            dogs={dogs}
            selectedDogIndex={selectedDogIndex}
            onAddDog={() => setIsAddingDog(true)}
            onDeleteDog={handleDeleteDog}
            calculateAge={calculateAge}
            formatBirthDate={formatBirthDate}
            onUpdateDog={(updatedDogs) => {
              // Will be handled by Supabase subscription
            }}
            onNavigateToStats={() => setActiveTab("statistics")}
            todayStats={todayStats}
            onSelectDog={setSelectedDogIndex}
            onNavigateToProfile={() => setActiveTab("profile")}
            onPhotoClick={handlePhotoClick}
            isUploadingPhoto={isUploadingPhoto}
            updateDog={updateDog}
            onEditDog={(dogId) => setEditingDogId(dogId)}
            filteredDogs={filteredDogs}
            currentDogIndex={currentDogIndex}
            setCurrentDogIndex={setCurrentDogIndex}
          />
        )}
        {activeTab === "diary" && <DiarySection />}
        {activeTab === "essentials" && <EssentialsSection />}
        {activeTab === "calendar" && <CalendarSection />}
        {activeTab === "statistics" && <StatisticsSection />}
        {activeTab === "profile" && <ProfileSection />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center justify-around">
            <NavButton
              icon={Scale}
              label={t("home")}
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavButton
              icon={Calendar}
              label={t("diary")}
              active={activeTab === "diary"}
              onClick={() => setActiveTab("diary")}
            />
            <NavButton
              icon={Heart}
              label={t("essentials")}
              active={activeTab === "essentials"}
              onClick={() => setActiveTab("essentials")}
              isLogo={true}
            />
            <NavButton
              icon={Activity}
              label={t("calendar")}
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
            />
            <NavButton
              icon={Droplets}
              label={t("statistics")}
              active={activeTab === "statistics"}
              onClick={() => setActiveTab("statistics")}
            />
            <NavButton
              icon={Heart}
              label={t("profile")}
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
          </div>
        </div>
      </nav>

      <AddDogDialog open={isAddingDog} onOpenChange={setIsAddingDog} onAddDog={handleAddDog} />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <NotificationsCenter open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} />
      {activeQuickAction === "feeding" && (
        <FeedingSection open={true} onOpenChange={(open) => !open && setActiveQuickAction(null)} />
      )}
      {activeQuickAction === "bath" && (
        <BathSection open={true} onOpenChange={(open) => !open && setActiveQuickAction(null)} />
      )}
      {activeQuickAction === "exercise" && (
        <ExerciseSection open={true} onOpenChange={(open) => !open && setActiveQuickAction(null)} />
      )}
      {activeQuickAction === "health" && (
        <HealthSection open={true} onOpenChange={(open) => !open && setActiveQuickAction(null)} />
      )}
      <EditDogProfileDialog
        open={!!editingDogId}
        onOpenChange={(open) => {
          if (!open) setEditingDogId(null)
        }}
        dogId={editingDogId || undefined}
      />
    </div>
  )
}

interface NavButtonProps {
  icon: any
  label: string
  active: boolean
  onClick: () => void
  isLogo?: boolean
}

function NavButton({ icon: Icon, label, active, onClick, isLogo = false }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {isLogo ? (
        <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
          <Image src="/meevi-logo.png" alt="Meevi" fill className="object-contain" />
        </div>
      ) : (
        Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
      <span className="text-[10px] sm:text-xs font-medium">{label}</span>
    </button>
  )
}

interface HomeTabProps {
  onQuickAction: (action: string) => void
  dogs: Dog[]
  selectedDogIndex: number
  onAddDog: () => void
  onDeleteDog: (dogId: string) => void
  calculateAge: (birthDate: string | undefined) => string
  formatBirthDate: (birthDate: string | undefined) => string
  onUpdateDog: (updatedDogs: Dog[]) => void
  onNavigateToStats: () => void
  todayStats: any
  onSelectDog: (index: number) => void
  onNavigateToProfile: () => void
  onPhotoClick: () => void
  isUploadingPhoto: boolean
  updateDog: (dogId: string, updates: Partial<Dog>) => Promise<void>
  onEditDog: (dogId: string) => void
  filteredDogs: Dog[]
  currentDogIndex: number
  setCurrentDogIndex: (index: number) => void
}

function HomeTab({
  onQuickAction,
  dogs,
  selectedDogIndex,
  onAddDog,
  onDeleteDog,
  calculateAge,
  formatBirthDate,
  onUpdateDog,
  onNavigateToStats,
  todayStats,
  onSelectDog,
  onNavigateToProfile,
  onPhotoClick,
  isUploadingPhoto,
  updateDog,
  onEditDog,
  filteredDogs,
  currentDogIndex,
  setCurrentDogIndex,
}: HomeTabProps) {
  const { t } = useLanguage()
  const [uploadingDogId, setUploadingDogId] = useState<string | null>(null)
  const dogFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleDogPhotoClick = (dogId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    console.log("[v0] Photo button clicked for dog:", dogId)
    console.log("[v0] File input ref exists:", !!dogFileInputRefs.current[dogId])
    dogFileInputRefs.current[dogId]?.click()
  }

  const handleDogPhotoChange = async (dogId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    console.log("[v0] Starting photo upload for dog:", dogId, "File size:", file.size, "bytes")
    setUploadingDogId(dogId)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dogId", dogId)

      const response = await fetch("/api/upload-dog-photo", {
        method: "POST",
        body: formData,
      })

      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        // If response is not JSON, read as text for debugging
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text)
        throw new Error("Resposta inválida do servidor")
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Upload failed")
      }

      console.log("[v0] Photo uploaded successfully, updating dog...")

      await updateDog(dogId, { photo: data.url })
      console.log("[v0] Photo updated successfully in UI")
      toast.success("Foto atualizada com sucesso!")
    } catch (error) {
      console.error("[v0] Error uploading photo:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao fazer upload da foto: ${errorMessage}`)
    } finally {
      setUploadingDogId(null)
      // Clear the input so the same file can be selected again
      event.target.value = ""
    }
  }

  if (dogs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <Card className="p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">{t("noDogs")}</p>
          <Button onClick={onAddDog} size="sm" className="sm:size-default">
            <Plus className="w-4 h-4 mr-2" />
            {t("addDog")}
          </Button>
        </Card>
      </div>
    )
  }

  const currentDog = dogs[selectedDogIndex]

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 sm:p-6 border-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 bg-card rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group flex-shrink-0"
            onClick={onPhotoClick}
          >
            <img
              src={currentDog.photo || "/cute-spitz-dog.jpg"}
              alt={currentDog.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploadingPhoto ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{currentDog.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentDog.breed} • {calculateAge(currentDog.birthDate)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0"
            onClick={onAddDog}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </Card>

      {/* Statistics Quick Access Card */}
      <Card
        className="p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onNavigateToStats}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base">{t("statistics")}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Visualize a rotina e progresso do seu pet
            </p>
          </div>
        </div>
      </Card>

      <Link href="/breed">
        <Card className="p-3 sm:p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base">{t("wiki")}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Aprenda tudo sobre o Spitz Alemão</p>
            </div>
          </div>
        </Card>
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Card
          className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onQuickAction("feeding")}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-center sm:text-left">{t("feeding")}</span>
          </div>
        </Card>
        <Card
          className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onQuickAction("bath")}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-center sm:text-left">{t("bath")}</span>
          </div>
        </Card>
        <Card
          className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onQuickAction("exercise")}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-center sm:text-left">{t("exercise")}</span>
          </div>
        </Card>
        <Card
          className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onQuickAction("health")}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-center sm:text-left">{t("health")}</span>
          </div>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t("today")}</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">{t("lastMeal")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{todayStats.lastMeal}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">{t("lastWalk")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{todayStats.lastWalk}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">{t("waterChanged")}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{todayStats.waterChanged}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Dogs List */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
          {t("yourDogs")}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {[...dogs]
            .sort((a, b) => {
              const dateA = new Date(a.birthDate || 0).getTime()
              const dateB = new Date(b.birthDate || 0).getTime()
              return dateB - dateA // Newest (youngest) first
            })
            .map((dog) => {
              return (
                <Card
                  key={dog.id}
                  className="p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    onEditDog(dog.id)
                  }}
                >
                  <input
                    ref={(el) => (dogFileInputRefs.current[dog.id] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleDogPhotoChange(dog.id, e)}
                  />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-card rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity relative group cursor-pointer"
                      onClick={(e) => handleDogPhotoClick(dog.id, e)}
                    >
                      <img
                        src={dog.photo || "/cute-spitz-dog.jpg"}
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploadingDogId === dog.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{dog.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {dog.breed || "Não especificado"} • {calculateAge(dog.birthDate)}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteDog(dog.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export { HomeScreen }
