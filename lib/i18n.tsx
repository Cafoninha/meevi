"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "pt" | "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  pt: {
    // Navigation
    home: "Início",
    diary: "Diário",
    statistics: "Estatísticas",
    calendar: "Agenda",
    essentials: "Essenciais",
    wiki: "Wiki de Raças",
    profile: "Perfil",
    yourDogs: "Seus Cachorros",

    // Home screen
    welcome: "Bem-vindo ao Meevi",
    quickActions: "Ações Rápidas",
    today: "Hoje",
    lastMeal: "Última refeição",
    waterChanged: "Água trocada",
    upcomingEvents: "Próximos Eventos",
    noEvents: "Nenhum evento agendado",
    viewAll: "Ver todos",

    // Quick Actions
    feeding: "Alimentação",
    bath: "Banho",
    exercise: "Exercício",
    health: "Saúde",

    // Dogs
    addDog: "Adicionar Cachorro",
    noDogs: "Nenhum cachorro cadastrado",
    selectDog: "Selecione um cachorro",
    allDogs: "Todos os cachorros",
    dogName: "Nome do cachorro",
    breed: "Raça",
    birthDate: "Data de nascimento",
    weight: "Peso",
    gender: "Sexo",
    male: "Macho",
    female: "Fêmea",
    color: "Cor",
    microchip: "Microchip",

    // Feeding
    feedingTitle: "Registrar Alimentação",
    foodType: "Tipo de comida",
    dryFood: "Ração seca",
    wetFood: "Ração úmida",
    homemade: "Caseira",
    snacks: "Petiscos",
    amount: "Quantidade",
    time: "Horário",
    notes: "Observações",

    // Bath
    bathTitle: "Registrar Banho",
    bathType: "Tipo de banho",
    fullBath: "Banho completo",
    quickBath: "Banho rápido",
    dryBath: "Banho seco",
    grooming: "Tosa",

    // Exercise
    exerciseTitle: "Registrar Exercício",
    exerciseType: "Tipo de exercício",
    walk: "Passeio",
    run: "Corrida",
    play: "Brincadeira",
    training: "Treinamento",
    duration: "Duração",
    minutes: "minutos",

    // Health
    healthTitle: "Saúde",
    vaccineStatus: "Status de Vacinação",
    completes: "Completas",
    pendingVaccines: "Existem vacinas pendentes para a idade atual",
    allVaccinesComplete: "Todas as vacunas estão em dia!",
    yearsOld: "anos de idade",
    months: "meses",
    addVaccine: "Adicionar Vacina",
    vaccineName: "Nome da vacina",
    vaccineDate: "Data da aplicação",
    nextDose: "Próxima dose",
    veterinarian: "Veterinário",

    // Calendar
    addEvent: "Adicionar Evento",
    eventType: "Tipo de evento",
    vaccine: "Vacina",
    vetAppointment: "Consulta Veterinária",
    bathGrooming: "Banho/Tosa",
    medication: "Medicação",
    reminder: "Lembrete",
    other: "Outro",
    eventTitle: "Título",
    eventDate: "Data",
    eventTime: "Horário",
    location: "Local",
    todayEvents: "Hoje",
    tomorrowEvents: "Amanhã",
    next7Days: "Próximos 7 dias",
    overdueEvents: "Atrasados",
    completedEvents: "Concluídos",
    noEventsScheduled: "Nenhum evento agendado",
    markAsComplete: "Marcar como concluído",

    // Essentials
    contacts: "Contatos",
    documents: "Documentos",
    guide: "Guia",
    emergencyContacts: "Contatos de Emergência",
    addContact: "Adicionar Contato",
    contactName: "Nome",
    contactType: "Tipo",
    veterinary: "Veterinário",
    clinic24h: "Clínica 24h",
    petShop: "Pet Shop",
    trainer: "Adestrador",
    phone: "Telefone",
    address: "Endereço",
    is24h: "Atendimento 24h",
    dogDocuments: "Documentos dos Cachorros",
    addDocument: "Adicionar Documento",
    documentTitle: "Título",
    documentType: "Tipo de documento",
    rg: "RG",
    vaccineCard: "Carteira de Vacinação",
    medicalHistory: "Histórico Médico",
    certificate: "Certificado",
    issueDate: "Data de emissão",
    expiryDate: "Data de validade",
    issuer: "Emissor",
    documentNumber: "Número do documento",

    // Profile
    profileTitle: "Perfil",
    ownerInfo: "Informações do Proprietário",
    editProfile: "Editar Perfil",
    ownerName: "Nome",
    email: "Email",
    telephone: "Telefone",
    notifications: "Notificações",
    notificationsVaccines: "Vacinas",
    notificationsFeeding: "Alimentação",
    notificationsBath: "Banho",
    notificationsExercise: "Exercícios",
    notificationsEvents: "Eventos",
    appPreferences: "Preferências do Aplicativo",
    language: "Idioma",
    selectLanguage: "Selecione o idioma do aplicativo",
    portugueseBrazil: "Português (Brasil)",
    englishUS: "English (US)",
    spanish: "Español",
    weightUnit: "Unidade de peso",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    auto: "Automático",
    dateFormat: "Formato de data",
    dataManagement: "Gerenciamento de Dados",
    exportData: "Exportar dados",
    exportDescription: "Baixe um backup de todos os seus dados",
    clearData: "Limpar todos os dados",
    clearDataWarning: "Atenção: Esta ação não pode ser desfeita",
    aboutMeevi: "Sobre o Meevi",
    support: "Suporte",

    // Buttons
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    close: "Fechar",
    confirm: "Confirmar",
    back: "Voltar",
    next: "Próximo",
    finish: "Concluir",
    add: "Adicionar",

    // Common
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    required: "Obrigatório",
    optional: "Opcional",
    search: "Pesquisar",
    filter: "Filtrar",
    sort: "Ordenar",
    yes: "Sim",
    no: "Não",
  },
  en: {
    // Navigation
    home: "Home",
    diary: "Diary",
    statistics: "Statistics",
    calendar: "Calendar",
    essentials: "Essentials",
    wiki: "Breed Wiki",
    profile: "Profile",
    yourDogs: "Your Dogs",

    // Home screen
    welcome: "Welcome to Meevi",
    quickActions: "Quick Actions",
    today: "Today",
    lastMeal: "Last meal",
    waterChanged: "Water changed",
    upcomingEvents: "Upcoming Events",
    noEvents: "No scheduled events",
    viewAll: "View all",

    // Quick Actions
    feeding: "Feeding",
    bath: "Bath",
    exercise: "Exercise",
    health: "Health",

    // Dogs
    addDog: "Add Dog",
    noDogs: "No dogs registered",
    selectDog: "Select a dog",
    allDogs: "All dogs",
    dogName: "Dog name",
    breed: "Breed",
    birthDate: "Birth date",
    weight: "Weight",
    gender: "Gender",
    male: "Male",
    female: "Female",
    color: "Color",
    microchip: "Microchip",

    // Feeding
    feedingTitle: "Record Feeding",
    foodType: "Food type",
    dryFood: "Dry food",
    wetFood: "Wet food",
    homemade: "Homemade",
    snacks: "Snacks",
    amount: "Amount",
    time: "Time",
    notes: "Notes",

    // Bath
    bathTitle: "Record Bath",
    bathType: "Bath type",
    fullBath: "Full bath",
    quickBath: "Quick bath",
    dryBath: "Dry bath",
    grooming: "Grooming",

    // Exercise
    exerciseTitle: "Record Exercise",
    exerciseType: "Exercise type",
    walk: "Walk",
    run: "Run",
    play: "Play",
    training: "Training",
    duration: "Duration",
    minutes: "minutes",

    // Health
    healthTitle: "Health",
    vaccineStatus: "Vaccination Status",
    completes: "Complete",
    pendingVaccines: "There are pending vaccines for current age",
    allVaccinesComplete: "All vaccines are up to date!",
    yearsOld: "years old",
    months: "months",
    addVaccine: "Add Vaccine",
    vaccineName: "Vaccine name",
    vaccineDate: "Application date",
    nextDose: "Next dose",
    veterinarian: "Veterinarian",

    // Calendar
    addEvent: "Add Event",
    eventType: "Event type",
    vaccine: "Vaccine",
    vetAppointment: "Vet Appointment",
    bathGrooming: "Bath/Grooming",
    medication: "Medication",
    reminder: "Reminder",
    other: "Other",
    eventTitle: "Title",
    eventDate: "Date",
    eventTime: "Time",
    location: "Location",
    todayEvents: "Today",
    tomorrowEvents: "Tomorrow",
    next7Days: "Next 7 days",
    overdueEvents: "Overdue",
    completedEvents: "Completed",
    noEventsScheduled: "No events scheduled",
    markAsComplete: "Mark as complete",

    // Essentials
    contacts: "Contacts",
    documents: "Documents",
    guide: "Guide",
    emergencyContacts: "Emergency Contacts",
    addContact: "Add Contact",
    contactName: "Name",
    contactType: "Type",
    veterinary: "Veterinary",
    clinic24h: "24h Clinic",
    petShop: "Pet Shop",
    trainer: "Trainer",
    phone: "Phone",
    address: "Address",
    is24h: "24h service",
    dogDocuments: "Dog Documents",
    addDocument: "Add Document",
    documentTitle: "Title",
    documentType: "Document type",
    rg: "ID",
    vaccineCard: "Vaccine Card",
    medicalHistory: "Medical History",
    certificate: "Certificate",
    issueDate: "Issue date",
    expiryDate: "Expiry date",
    issuer: "Issuer",
    documentNumber: "Document number",

    // Profile
    profileTitle: "Profile",
    ownerInfo: "Owner Information",
    editProfile: "Edit Profile",
    ownerName: "Name",
    email: "Email",
    telephone: "Phone",
    notifications: "Notifications",
    notificationsVaccines: "Vaccines",
    notificationsFeeding: "Feeding",
    notificationsBath: "Bath",
    notificationsExercise: "Exercise",
    notificationsEvents: "Events",
    appPreferences: "App Preferences",
    language: "Language",
    selectLanguage: "Select app language",
    portugueseBrazil: "Português (Brasil)",
    englishUS: "English (US)",
    spanish: "Español",
    weightUnit: "Weight unit",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    dateFormat: "Date format",
    dataManagement: "Data Management",
    exportData: "Export data",
    exportDescription: "Download a backup of all your data",
    clearData: "Clear all data",
    clearDataWarning: "Warning: This action cannot be undone",
    aboutMeevi: "About Meevi",
    support: "Support",

    // Buttons
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    finish: "Finish",
    add: "Add",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    yes: "Yes",
    no: "No",
  },
  es: {
    // Navigation
    home: "Inicio",
    diary: "Diario",
    statistics: "Estadísticas",
    calendar: "Agenda",
    essentials: "Esenciales",
    wiki: "Wiki de Razas",
    profile: "Perfil",
    yourDogs: "Tus Perros",

    // Home screen
    welcome: "Bienvenido a Meevi",
    quickActions: "Acciones Rápidas",
    today: "Hoy",
    lastMeal: "Última comida",
    waterChanged: "Agua cambiada",
    upcomingEvents: "Próximos Eventos",
    noEvents: "No hay eventos programados",
    viewAll: "Ver todos",

    // Quick Actions
    feeding: "Alimentación",
    bath: "Baño",
    exercise: "Ejercicio",
    health: "Salud",

    // Dogs
    addDog: "Agregar Perro",
    noDogs: "No hay perros registrados",
    selectDog: "Seleccione un perro",
    allDogs: "Todos los perros",
    dogName: "Nombre del perro",
    breed: "Raza",
    birthDate: "Fecha de nacimiento",
    weight: "Peso",
    gender: "Sexo",
    male: "Macho",
    female: "Hembra",
    color: "Color",
    microchip: "Microchip",

    // Feeding
    feedingTitle: "Registrar Alimentación",
    foodType: "Tipo de comida",
    dryFood: "Comida seca",
    wetFood: "Comida húmeda",
    homemade: "Casera",
    snacks: "Golosinas",
    amount: "Cantidad",
    time: "Hora",
    notes: "Notas",

    // Bath
    bathTitle: "Registrar Baño",
    bathType: "Tipo de baño",
    fullBath: "Baño completo",
    quickBath: "Baño rápido",
    dryBath: "Baño seco",
    grooming: "Peluquería",

    // Exercise
    exerciseTitle: "Registrar Ejercicio",
    exerciseType: "Tipo de ejercicio",
    walk: "Paseo",
    run: "Carrera",
    play: "Juego",
    training: "Entrenamiento",
    duration: "Duración",
    minutes: "minutos",

    // Health
    healthTitle: "Salud",
    vaccineStatus: "Estado de Vacunación",
    completes: "Completas",
    pendingVaccines: "Hay vacunas pendientes para la edad actual",
    allVaccinesComplete: "¡Todas las vacunas están al día!",
    yearsOld: "años de edad",
    months: "meses",
    addVaccine: "Agregar Vacuna",
    vaccineName: "Nombre de la vacuna",
    vaccineDate: "Fecha de aplicación",
    nextDose: "Próxima dosis",
    veterinarian: "Veterinario",

    // Calendar
    addEvent: "Agregar Evento",
    eventType: "Tipo de evento",
    vaccine: "Vacuna",
    vetAppointment: "Consulta Veterinaria",
    bathGrooming: "Baño/Peluquería",
    medication: "Medicación",
    reminder: "Recordatorio",
    other: "Otro",
    eventTitle: "Título",
    eventDate: "Fecha",
    eventTime: "Hora",
    location: "Ubicación",
    todayEvents: "Hoy",
    tomorrowEvents: "Mañana",
    next7Days: "Próximos 7 días",
    overdueEvents: "Atrasados",
    completedEvents: "Completados",
    noEventsScheduled: "No hay eventos programados",
    markAsComplete: "Marcar como completado",

    // Essentials
    contacts: "Contactos",
    documents: "Documentos",
    guide: "Guía",
    emergencyContacts: "Contactos de Emergencia",
    addContact: "Agregar Contacto",
    contactName: "Nombre",
    contactType: "Tipo",
    veterinary: "Veterinario",
    clinic24h: "Clínica 24h",
    petShop: "Tienda de Mascotas",
    trainer: "Entrenador",
    phone: "Teléfono",
    address: "Dirección",
    is24h: "Servicio 24h",
    dogDocuments: "Documentos de los Perros",
    addDocument: "Agregar Documento",
    documentTitle: "Título",
    documentType: "Tipo de documento",
    rg: "Identificación",
    vaccineCard: "Cartilla de Vacunación",
    medicalHistory: "Historial Médico",
    certificate: "Certificado",
    issueDate: "Fecha de emisión",
    expiryDate: "Fecha de vencimiento",
    issuer: "Emisor",
    documentNumber: "Número de documento",

    // Profile
    profileTitle: "Perfil",
    ownerInfo: "Información del Propietario",
    editProfile: "Editar Perfil",
    ownerName: "Nombre",
    email: "Correo electrónico",
    telephone: "Teléfono",
    notifications: "Notificaciones",
    notificationsVaccines: "Vacunas",
    notificationsFeeding: "Alimentación",
    notificationsBath: "Baño",
    notificationsExercise: "Ejercicios",
    notificationsEvents: "Eventos",
    appPreferences: "Preferencias de la Aplicación",
    language: "Idioma",
    selectLanguage: "Seleccione el idioma de la aplicación",
    portugueseBrazil: "Português (Brasil)",
    englishUS: "English (US)",
    spanish: "Español",
    weightUnit: "Unidad de peso",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    auto: "Automático",
    dateFormat: "Formato de fecha",
    dataManagement: "Gestión de Datos",
    exportData: "Exportar datos",
    exportDescription: "Descargue una copia de seguridad de todos sus datos",
    clearData: "Borrar todos los datos",
    clearDataWarning: "Advertencia: Esta acción no se puede deshacer",
    aboutMeevi: "Acerca de Meevi",
    support: "Soporte",

    // Buttons
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    confirm: "Confirmar",
    back: "Atrás",
    next: "Siguiente",
    finish: "Finalizar",
    add: "Agregar",

    // Common
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    required: "Obligatorio",
    optional: "Opcional",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    yes: "Sí",
    no: "No",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("meevi_language") as Language
    if (savedLanguage && ["pt", "en", "es"].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("meevi_language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.pt] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
