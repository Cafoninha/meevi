"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Dog,
  Bell,
  Moon,
  Info,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Camera,
  Settings,
  LogOut,
  Shield,
  LogIn,
  Cloud,
  CloudOff,
  BellRing,
} from "lucide-react"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { EditDogProfileDialog } from "@/components/edit-dog-profile-dialog"
import { AboutMeeviDialog } from "@/components/about-meevi-dialog"
import { SupportDialog } from "@/components/support-dialog"
import { AuthDialog } from "@/components/auth-dialog"
import { useLanguage, type Language } from "@/lib/i18n"
import { SyncService } from "@/lib/sync-service"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useUserPreferences } from "@/lib/hooks/use-supabase-data" // Added hook
import { Label } from "@/components/ui/label" // Added Label component

interface NotificationSettings {
  all: boolean
  vaccines: boolean
  feeding: boolean
  bath: boolean
  exercise: boolean
  events: boolean
}

interface AppPreferences {
  language: string
  weightUnit: string
  temperatureUnit: string
  dateFormat: string
}

function ProfileSection() {
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, signOut } = useAuth()

  const {
    preferences,
    loading: preferencesLoading,
    updateNotificationSettings: updateNotificationSettingsDB,
    updateAppPreferences: updateAppPreferencesDB,
    updateDarkMode: updateDarkModeDB,
  } = useUserPreferences()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditDogOpen, setIsEditDogOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null)
  const [dogPhoto, setDogPhoto] = useState<string>("/cute-spitz-dog.jpg")

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [ownerData, setOwnerData] = useState<any>(null)

  const [syncStatus, setSyncStatus] = useState<string>("Nunca sincronizado")
  const [isSyncing, setIsSyncing] = useState(false)

  const [currentDog, setCurrentDog] = useState<any>(null)

  const [showConfetti, setShowConfetti] = useState(false)

  const ownerPhotoInputRef = useRef<HTMLInputElement>(null)
  const dogPhotoInputRef = useRef<HTMLInputElement>(null)

  const syncService = new SyncService()

  useEffect(() => {
    loadOwnerData()
    loadLastSyncTime()
    loadCurrentDog()
    if (isAuthenticated && user) {
      autoSyncFromCloud()
    }
    if (preferences?.dark_mode !== undefined) {
      applyTheme(preferences.dark_mode)
    }
  }, [isAuthenticated, preferences?.dark_mode]) // Added dependency for preferences?.dark_mode

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPreferencesFromSupabase()
    }
  }, [isAuthenticated, user])

  const autoSyncFromCloud = async () => {
    if (!user) return

    try {
      console.log("[v0] Auto-syncing data from cloud...")
      const result = await syncService.syncFromCloud(user.id)
      if (result.isSuccess) {
        setSyncStatus(`Sincronizado: ${new Date(result.lastSync!).toLocaleString()}`)
        loadOwnerData()
        loadCurrentDog()
      }
    } catch (error) {
      console.error("[v0] Auto-sync failed:", error)
    }
  }

  const loadCurrentDog = () => {
    try {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        const dogs = JSON.parse(storedDogs)
        if (dogs.length > 0) {
          setCurrentDog(dogs[0])
          if (dogs[0].photo) {
            setDogPhoto(dogs[0].photo)
          }
        }
      }
    } catch (error) {
      console.error("Error loading current dog:", error)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "Idade não informada"
    const birth = new Date(birthDate)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()

    if (years > 0) {
      return `${years} ano${years > 1 ? "s" : ""}`
    } else if (months > 0) {
      return `${months} mês${months > 1 ? "es" : ""}`
    } else {
      return "Menos de 1 mês"
    }
  }

  const formatBirthDate = (birthDate: string) => {
    if (!birthDate) return "Não informada"
    const date = new Date(birthDate)
    // Use language-specific formatting if available
    const locale = appPreferences.language || navigator.language || "pt-BR"
    return date.toLocaleDateString(locale)
  }

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleDarkModeToggle = async (enabled: boolean) => {
    applyTheme(enabled)

    try {
      await updateDarkModeDB(enabled)
      console.log("[v0] Dark mode updated successfully")
    } catch (err) {
      console.error("[v0] Failed to update dark mode:", err)
      // Revert on error
      applyTheme(!enabled)
    }
  }

  const handleNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!preferences) return

    const currentSettings = preferences.notification_settings
    const updated = { ...currentSettings, [key]: value }

    if (key === "all") {
      // When toggling "all", set all individual notifications to the same value
      updated.vaccines = value
      updated.feeding = value
      updated.bath = value
      updated.exercise = value
      updated.events = value
    }

    try {
      await updateNotificationSettingsDB(updated)

      if (key === "all" && value) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }

      console.log("[v0] Notification settings updated successfully")
    } catch (err) {
      console.error("[v0] Failed to update notification settings:", err)
    }
  }

  const handleAppPreferenceChange = async (key: keyof AppPreferences, value: string) => {
    if (!preferences) return

    const updated = { ...preferences.app_preferences, [key]: value }

    try {
      await updateAppPreferencesDB(updated)

      if (key === "language") {
        setLanguage(value)
      }

      console.log("[v0] App preferences updated successfully")
    } catch (err) {
      console.error("[v0] Failed to update app preferences:", err)
    }
  }

  const handleLanguageChange = (lang: string) => {
    // Simplified language mapping to match updated SelectItems
    const languageMap: { [key: string]: Language } = {
      pt: "pt",
      en: "en",
      es: "es",
    }

    const newLanguage = languageMap[lang] || "pt"
    setLanguage(newLanguage)
    handleAppPreferenceChange("language", lang)
  }

  useEffect(() => {
    const langCodeMap: Record<Language, string> = {
      pt: "pt",
      en: "en",
      es: "es",
    }
    const prefLang = langCodeMap[language]
    if (appPreferences.language !== prefLang) {
      // No need to call handleAppPreferenceChange here, as it's handled by the user selecting language
    }
  }, [language])

  const loadOwnerData = () => {
    const storedOwnerId = localStorage.getItem("ownerId")
    if (!storedOwnerId) return

    setOwnerId(storedOwnerId)

    try {
      const ownerDataStr = localStorage.getItem("owner")
      if (ownerDataStr) {
        const data = JSON.parse(ownerDataStr)
        setOwnerData(data)
        if (data.photo) {
          setOwnerPhoto(data.photo)
        }
      }
    } catch (error) {
      console.error("Error loading owner data:", error)
    }
  }

  const handleOwnerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const photoUrl = reader.result as string
        setOwnerPhoto(photoUrl)

        if (ownerId) {
          try {
            const ownerDataStr = localStorage.getItem("owner")
            if (ownerDataStr) {
              const data = JSON.parse(ownerDataStr)
              data.photo = photoUrl
              localStorage.setItem("owner", JSON.stringify(data))
            }
          } catch (error) {
            console.error("Error saving photo:", error)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDogPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const photoUrl = reader.result as string
        setDogPhoto(photoUrl)
        if (currentDog) {
          try {
            const storedDogs = localStorage.getItem("dogs")
            if (storedDogs) {
              const dogs = JSON.parse(storedDogs) // Typo corrected here
              const updatedDogs = dogs.map((dog: any) => (dog.id === currentDog.id ? { ...dog, photo: photoUrl } : dog))
              localStorage.setItem("dogs", JSON.stringify(updatedDogs))
              setCurrentDog({ ...currentDog, photo: photoUrl })
            }
          } catch (error) {
            console.error("Error updating dog photo:", error)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExportData = () => {
    try {
      const data = {
        owner: localStorage.getItem("owner"),
        dogs: localStorage.getItem("dogs"),
        diary: localStorage.getItem("meevi_diary_entries"),
        events: localStorage.getItem("calendarEvents"),
        contacts: localStorage.getItem("meevi_contacts"),
        documents: localStorage.getItem("meevi_documents"),
        vaccineStatus: Object.keys(localStorage)
          .filter((key) => key.startsWith("meevi_vaccine_status_"))
          .map((key) => ({ [key]: localStorage.getItem(key) })),
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `meevi-backup-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      alert("Dados exportados com sucesso!")
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Erro ao exportar dados. Tente novamente.")
    }
  }

  const handleClearAllData = () => {
    const confirmed = confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")

    if (confirmed) {
      const doubleConfirm = confirm("ATENÇÃO: Todos os seus dados serão permanentemente removidos. Deseja continuar?")

      if (doubleConfirm) {
        localStorage.clear()
        alert("Todos os dados foram removidos. A página será recarregada.")
        window.location.href = "/"
      }
    }
  }

  const handleLogout = async () => {
    const confirmed = confirm("Deseja sair? Seus dados locais serão mantidos.")
    if (confirmed) {
      await signOut()
      alert("Você saiu da conta. Seus dados locais ainda estão disponíveis.")
    }
  }

  const loadLastSyncTime = () => {
    const lastSync = syncService.getLastSyncTime()
    if (lastSync) {
      const date = new Date(lastSync)
      setSyncStatus(`Última sincronização: ${date.toLocaleString()}`)
    }
  }

  const handleBackupToCloud = async () => {
    if (!isAuthenticated || !user) {
      alert("Você precisa fazer login para fazer backup na nuvem.")
      setIsAuthOpen(true)
      return
    }

    setIsSyncing(true)
    const result = await syncService.syncToCloud(user.id)
    setIsSyncing(false)

    if (result.isSuccess) {
      setSyncStatus(`Última sincronização: ${new Date(result.lastSync!).toLocaleString()}`)
      alert(result.message)
    } else {
      alert(`Erro: ${result.message}`)
    }
  }

  const handleRestoreFromCloud = async () => {
    if (!isAuthenticated || !user) {
      alert("Você precisa fazer login para restaurar dados da nuvem.")
      setIsAuthOpen(true)
      return
    }

    const confirmed = confirm("Deseja restaurar os dados da nuvem? Isso substituirá os dados locais atuais.")

    if (!confirmed) return

    setIsSyncing(true)
    const result = await syncService.syncFromCloud(user.id)
    setIsSyncing(false)

    if (result.isSuccess) {
      setSyncStatus(`Última sincronização: ${new Date(result.lastSync!).toLocaleString()}`)
      alert(result.message + " A página será recarregada.")
      window.location.reload()
    } else {
      alert(`Erro: ${result.message}`)
    }
  }

  const handleEditDogSave = () => {
    loadCurrentDog()
  }

  const loadPreferencesFromSupabase = async () => {
    if (!user) return

    const supabase = createClient()

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle()

    if (error) {
      console.error("Error loading preferences from Supabase:", error)
      return
    }

    if (data) {
      // Update local state based on fetched data - This part is now handled by the useUserPreferences hook
    } else {
      // If no preferences exist, insert default ones
      await supabase.from("user_preferences").insert([
        {
          user_id: user.id,
          // Use initial state values if preferences are not yet loaded from hook
          notification_settings: { all: true, vaccines: true, feeding: true, bath: true, exercise: true, events: true },
          app_preferences: {
            language: language,
            weightUnit: "kg",
            temperatureUnit: "celsius",
            dateFormat: "dd/mm/yyyy",
          },
          dark_mode: false,
        },
      ])
    }
  }

  const notificationSettings = preferences?.notification_settings || {
    all: true,
    vaccines: true,
    feeding: true,
    bath: true,
    exercise: true,
    events: true,
  }

  const appPreferences = preferences?.app_preferences || {
    language: language,
    weightUnit: "kg",
    temperatureUnit: "celsius",
    dateFormat: "dd/mm/yyyy",
  }

  const darkModeEnabled = preferences?.dark_mode ?? false // Use ?? for potential undefined

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border">
        <h2 className="text-lg sm:text-xl font-bold">{t("profileTitle")}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Gerencie suas informações e preferências</p>
      </div>

      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            Conta e Sincronização
          </h3>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Cloud className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Conectado</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Modo Local</p>
                      <p className="text-xs text-muted-foreground">Faça login para backup na nuvem</p>
                    </div>
                  </>
                )}
              </div>
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsAuthOpen(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Fazer Login
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            {t("ownerInfo")}
          </h3>
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {ownerPhoto ? (
                  <img src={ownerPhoto || "/placeholder.svg"} alt="Owner" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                )}
                <input
                  ref={ownerPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleOwnerPhotoChange}
                />
                <button
                  onClick={() => ownerPhotoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold truncate">{ownerData?.name || t("loading")}</h3>
                <div className="space-y-1 mt-2">
                  {ownerData?.email && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{ownerData.email}</span>
                    </div>
                  )}
                  {ownerData?.phone && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{ownerData.phone}</span>
                    </div>
                  )}
                  {ownerData?.location && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{ownerData.location}</span>
                    </div>
                  )}
                  {!ownerData?.email && !ownerData?.phone && !ownerData?.location && ownerData && (
                    <p className="text-xs sm:text-sm text-muted-foreground">Adicione suas informações de contato</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 sm:mt-4 bg-transparent h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {t("editProfile")}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            Meu Pet
          </h3>
          {!currentDog ? (
            <Card className="p-4 sm:p-6">
              <div className="text-center py-6 sm:py-8">
                <Dog className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground mb-4">Nenhum cachorro cadastrado</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Cadastre seu primeiro pet na aba "Seus Cachorros"
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative flex-shrink-0">
                  <img
                    src={dogPhoto || "/placeholder.svg"}
                    alt={currentDog.name}
                    className="w-full h-full object-cover"
                  />
                  <input
                    ref={dogPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDogPhotoChange}
                  />
                  <button
                    onClick={() => dogPhotoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">{currentDog.name}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Dog className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{currentDog.breed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {currentDog.gender === "male" ? "Macho" : "Fêmea"} • {calculateAge(currentDog.birthDate)} •{" "}
                        {currentDog.weight || "Peso não informado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="truncate">Nascimento: {formatBirthDate(currentDog.birthDate)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 sm:mt-4 bg-transparent h-8 sm:h-9 text-xs sm:text-sm"
                    onClick={() => setIsEditDogOpen(true)}
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Editar Pet
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            {t("notifications")}
          </h3>
          {/* <Card className="divide-y divide-border"> Removed this Card to use the new one below */}

          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <div className="text-6xl animate-bounce">🎉</div>
            </div>
          )}

          {/* Replaced old notification Card with a new structure */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h3 className="font-semibold text-base sm:text-lg">Notificações</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-primary" />
                  <Label htmlFor="notification-all" className="cursor-pointer text-sm sm:text-base font-medium">
                    Todas as Notificações
                  </Label>
                </div>
                <Switch
                  id="notification-all"
                  checked={notificationSettings.all}
                  onCheckedChange={(checked) => handleNotificationToggle("all", checked)}
                  disabled={preferencesLoading}
                />
              </div>

              <div className="space-y-2 sm:space-y-3 pl-2 sm:pl-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-vaccines" className="cursor-pointer text-sm">
                    Lembretes de Vacinas
                  </Label>
                  <Switch
                    id="notification-vaccines"
                    checked={notificationSettings.vaccines}
                    onCheckedChange={(checked) => handleNotificationToggle("vaccines", checked)}
                    disabled={preferencesLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-feeding" className="cursor-pointer text-sm">
                    Lembretes de Alimentação
                  </Label>
                  <Switch
                    id="notification-feeding"
                    checked={notificationSettings.feeding}
                    onCheckedChange={(checked) => handleNotificationToggle("feeding", checked)}
                    disabled={preferencesLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-bath" className="cursor-pointer text-sm">
                    Lembretes de Banho
                  </Label>
                  <Switch
                    id="notification-bath"
                    checked={notificationSettings.bath}
                    onCheckedChange={(checked) => handleNotificationToggle("bath", checked)}
                    disabled={preferencesLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-exercise" className="cursor-pointer text-sm">
                    Lembretes de Exercício
                  </Label>
                  <Switch
                    id="notification-exercise"
                    checked={notificationSettings.exercise}
                    onCheckedChange={(checked) => handleNotificationToggle("exercise", checked)}
                    disabled={preferencesLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notification-events" className="cursor-pointer text-sm">
                    Eventos do Calendário
                  </Label>
                  <Switch
                    id="notification-events"
                    checked={notificationSettings.events}
                    onCheckedChange={(checked) => handleNotificationToggle("events", checked)}
                    disabled={preferencesLoading}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            {t("appPreferences")}
          </h3>
          {/* <Card className="divide-y divide-border"> Removed this Card to use the new one below */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h3 className="font-semibold text-base sm:text-lg">Preferências do App</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm">
                  Idioma
                </Label>
                <Select
                  value={appPreferences.language}
                  onValueChange={(value) => handleAppPreferenceChange("language", value)}
                  disabled={preferencesLoading}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight-unit" className="text-sm">
                  Unidade de Peso
                </Label>
                <Select
                  value={appPreferences.weightUnit}
                  onValueChange={(value) => handleAppPreferenceChange("weightUnit", value)}
                  disabled={preferencesLoading}
                >
                  <SelectTrigger id="weight-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    <SelectItem value="lb">Libras (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature-unit" className="text-sm">
                  Unidade de Temperatura
                </Label>
                <Select
                  value={appPreferences.temperatureUnit}
                  onValueChange={(value) => handleAppPreferenceChange("temperatureUnit", value)}
                  disabled={preferencesLoading}
                >
                  <SelectTrigger id="temperature-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format" className="text-sm">
                  Formato de Data
                </Label>
                <Select
                  value={appPreferences.dateFormat}
                  onValueChange={(value) => handleAppPreferenceChange("dateFormat", value)}
                  disabled={preferencesLoading}
                >
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <Label htmlFor="dark-mode" className="cursor-pointer text-sm">
                    Modo Escuro
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkModeEnabled}
                  onCheckedChange={handleDarkModeToggle}
                  disabled={preferencesLoading}
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            {isAuthenticated ? (
              <Cloud className="w-4 h-4 text-green-600" />
            ) : (
              <CloudOff className="w-4 h-4 text-gray-400" />
            )}
            <span>{syncStatus}</span>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-2 sm:py-3 bg-transparent"
              onClick={handleBackupToCloud}
              disabled={isSyncing}
            >
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <div className="text-left flex-1">
                <div className="text-xs sm:text-sm font-medium">
                  {isSyncing ? "Sincronizando..." : "Fazer Backup na Nuvem"}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {isAuthenticated ? "Salvar dados no Supabase" : "Login necessário"}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-2 sm:py-3 bg-transparent"
              onClick={handleRestoreFromCloud}
              disabled={isSyncing}
            >
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <div className="text-left flex-1">
                <div className="text-xs sm:text-sm font-medium">
                  {isSyncing ? "Restaurando..." : "Restaurar da Nuvem"}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {isAuthenticated ? "Baixar dados do Supabase" : "Login necessário"}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto" />
            </Button>
          </div>
        </Card>

        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
            Sobre
          </h3>
          <Card className="divide-y divide-border">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-3 sm:p-4 flex items-center justify-between gap-3 w-full text-left hover:bg-secondary/50 transition-colors min-h-[3rem]"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">{t("aboutMeevi")}</span>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </button>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="p-3 sm:p-4 flex items-center justify-between gap-3 w-full text-left hover:bg-secondary/50 transition-colors min-h-[3rem]"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">{t("support")}</span>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </button>
            <button className="p-3 sm:p-4 flex items-center justify-between gap-3 w-full text-left hover:bg-secondary/50 transition-colors min-h-[3rem]">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm truncate">Versão</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">1.0.0</span>
            </button>
          </Card>
        </div>
      </div>

      <EditProfileDialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen} />
      <EditDogProfileDialog
        open={isEditDogOpen}
        onOpenChange={setIsEditDogOpen}
        dog={currentDog}
        onSave={handleEditDogSave}
      />
      <AboutMeeviDialog open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SupportDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  )
}

export default ProfileSection
