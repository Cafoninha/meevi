"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Home,
  BookOpen,
  Heart,
  Calendar,
  User,
  Plus,
  Utensils,
  Bath,
  Activity,
  Trash2,
  BarChart3,
  Droplet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DiarySection } from "@/components/diary-section"
import { EssentialsSection } from "@/components/essentials-section"
import { CalendarSection } from "@/components/calendar-section"
import { ProfileSection } from "@/components/profile-section"
import { StatisticsSection } from "@/components/statistics-section"
import { FeedingSection } from "@/components/feeding-section"
import { BathSection } from "@/components/bath-section"
import { ExerciseSection } from "@/components/exercise-section"
import { HealthSection } from "@/components/health-section"
import { AddDogDialog } from "@/components/add-dog-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { useLanguage } from "@/lib/i18n"
import Link from "next/link"
import Image from "next/image"
import { useDogs, useDiaryEntries } from "@/lib/hooks/use-supabase-data"
import { useAuth } from "@/lib/auth-context"

type Tab = "home" | "diary" | "essentials" | "calendar" | "statistics" | "profile"

interface Dog {
  id: string
  name: string
  birth_date: string
  breed: string
  owner_id: string
  photo?: string
}

interface Owner {
  id: string
  name: string
  age?: number | null
  gender?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  photo?: string | null
}

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null)
  const { dogs, loading: dogsLoading, addDog, updateDog, deleteDog } = useDogs()
  const { entries: diaryEntries } = useDiaryEntries()
  const { user } = useAuth()
  const [selectedDogIndex, setSelectedDogIndex] = useState(0)
  const [showAddDogDialog, setShowAddDogDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [todayStats, setTodayStats] = useState({
    lastMeal: null as string | null,
    lastWalk: null as string | null,
    waterChanged: null as string | null,
  })
  const { t } = useLanguage()

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

  const handleAddDog = async (dogData: { name: string; birthDate: string }) => {
    try {
      await addDog({
        name: dogData.name,
        birthDate: dogData.birthDate,
        breed: "Spitz Alemão",
        gender: "Macho",
        weight: "5",
        photo: "/placeholder.svg?height=200&width=200",
      })
      setShowAddDogDialog(false)
    } catch (error) {
      console.error("[v0] Error adding dog:", error)
      alert("Erro ao adicionar cachorro. Tente novamente.")
    }
  }

  const handleDeleteDog = async (dogId: string) => {
    if (dogs.length === 1) {
      alert("Você precisa ter pelo menos um cachorro cadastrado!")
      return
    }

    try {
      await deleteDog(dogId)
      if (dogs[selectedDogIndex]?.id === dogId) {
        setSelectedDogIndex(0)
      }
    } catch (error) {
      console.error("[v0] Error deleting dog:", error)
      alert("Erro ao deletar cachorro. Tente novamente.")
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-primary">Meevi</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {user?.name ? `${t("welcome").split(" ")[0]}, ${user.name}` : t("welcome")}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
            onClick={() => setShowSettingsDialog(true)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {activeTab === "home" && (
          <HomeTab
            onQuickAction={setActiveQuickAction}
            dogs={dogs}
            selectedDogIndex={selectedDogIndex}
            onAddDog={() => setShowAddDogDialog(true)}
            onDeleteDog={handleDeleteDog}
            calculateAge={calculateAge}
            formatBirthDate={formatBirthDate}
            onUpdateDog={updateDog}
            onNavigateToStats={() => setActiveTab("statistics")}
            todayStats={todayStats}
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
              icon={Home}
              label={t("home")}
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavButton
              icon={BookOpen}
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
              icon={Calendar}
              label={t("calendar")}
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
            />
            <NavButton
              icon={BarChart3}
              label={t("statistics")}
              active={activeTab === "statistics"}
              onClick={() => setActiveTab("statistics")}
            />
            <NavButton
              icon={User}
              label={t("profile")}
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
          </div>
        </div>
      </nav>

      <FeedingSection
        open={activeQuickAction === "feeding"}
        onOpenChange={(open) => !open && setActiveQuickAction(null)}
      />
      <BathSection open={activeQuickAction === "bath"} onOpenChange={(open) => !open && setActiveQuickAction(null)} />
      <ExerciseSection
        open={activeQuickAction === "exercise"}
        onOpenChange={(open) => !open && setActiveQuickAction(null)}
      />
      <HealthSection
        open={activeQuickAction === "health"}
        onOpenChange={(open) => !open && setActiveQuickAction(null)}
      />

      <AddDogDialog open={showAddDogDialog} onOpenChange={setShowAddDogDialog} onAddDog={handleAddDog} />
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        owner={user}
        onOwnerUpdate={updateDog}
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
      className={cn(
        "flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
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
  onUpdateDog: () => void
  onNavigateToStats: () => void
  todayStats: any
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
}: HomeTabProps) {
  const { t } = useLanguage()
  const dogPhotoInputRef = useRef<HTMLInputElement>(null)

  const handleDogPhotoClick = () => {
    dogPhotoInputRef.current?.click()
  }

  const handleDogPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      const currentDog = dogs[selectedDogIndex]

      const updatedDogs = dogs.map((dog) => (dog.id === currentDog.id ? { ...dog, photo: base64String } : dog))

      onUpdateDog(updatedDogs)
    }
    reader.readAsDataURL(file)
  }

  const handleDogCardPhotoClick = (dogId: string) => {
    const input = document.getElementById(`dog-photo-${dogId}`) as HTMLInputElement
    input?.click()
  }

  const handleDogCardPhotoChange = (event: React.ChangeEvent<HTMLInputElement>, dogId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string

      const updatedDogs = dogs.map((dog) => (dog.id === dogId ? { ...dog, photo: base64String } : dog))

      onUpdateDog(updatedDogs)
    }
    reader.readAsDataURL(file)
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
            onClick={handleDogPhotoClick}
          >
            <img
              src={currentDog.photo || "/cute-spitz-dog.jpg"}
              alt={currentDog.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <input
            ref={dogPhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleDogPhotoChange}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{currentDog.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {currentDog.breed} • {calculateAge(currentDog.birth_date)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
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
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
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
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
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
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
              <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
              <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
          {dogs.map((dog) => (
            <Card key={dog.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => handleDogCardPhotoClick(dog.id)}
                >
                  <img src={dog.photo || "/cute-spitz-dog.jpg"} alt={dog.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input
                  id={`dog-photo-${dog.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleDogCardPhotoChange(e, dog.id)}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{dog.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {dog.breed} • {calculateAge(dog.birth_date)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                    Nascimento: {formatBirthDate(dog.birth_date)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                  onClick={() => onDeleteDog(dog.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
