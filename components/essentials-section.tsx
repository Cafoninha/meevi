"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Utensils,
  Bath,
  Scissors,
  Heart,
  Pill,
  Droplets,
  Dog,
  ChevronRight,
  Search,
  AlertCircle,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  FileText,
  BookOpen,
  Stethoscope,
  Building2,
  Clock,
  User,
} from "lucide-react"
import { EssentialDetailDialog } from "@/components/essential-detail-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Essential {
  id: string
  category: "food" | "hygiene" | "grooming" | "health" | "hydration" | "exercise"
  title: string
  description: string
  frequency: string
  tips: string[]
  warnings?: string[]
}

interface EmergencyContact {
  id: string
  dogId?: string
  type: "veterinario" | "clinica" | "petshop" | "outro"
  name: string
  phone: string
  address?: string
  notes?: string
  is24h?: boolean
}

interface DogDocument {
  id: string
  dogId: string
  type: "rg" | "vaccine" | "medical" | "other"
  title: string
  description?: string
  date: string
  fileUrl?: string
  notes?: string
}

type TabType = "contacts" | "documents" | "guides"

const essentials: Essential[] = [
  {
    id: "1",
    category: "food",
    title: "Alimentação Balanceada",
    description: "Dieta equilibrada com ração de qualidade premium específica para raças pequenas",
    frequency: "2-3 vezes ao dia",
    tips: [
      "Use ração premium específica para raças pequenas",
      "Divida em 2-3 porções diárias",
      "Evite comida humana, especialmente chocolate, uva e cebola",
      "Mantenha horários regulares de alimentação",
      "Porção recomendada: 40-60g por refeição (varia com peso)",
    ],
    warnings: ["Nunca dê chocolate, uva, cebola ou alho ao seu Spitz"],
  },
  {
    id: "2",
    category: "hydration",
    title: "Hidratação Constante",
    description: "Água fresca e limpa sempre disponível",
    frequency: "Troca 2x ao dia",
    tips: [
      "Troque a água pelo menos 2 vezes ao dia",
      "Mantenha o bebedouro sempre limpo",
      "Observe o consumo - mudanças podem indicar problemas",
      "No verão, adicione cubos de gelo",
    ],
  },
  {
    id: "3",
    category: "bath",
    title: "Banho Regular",
    description: "Banhos frequentes para manter a pelagem limpa e saudável",
    frequency: "A cada 7-15 dias",
    tips: [
      "Use shampoo específico para cães",
      "Água morna, nunca quente",
      "Seque bem, especialmente as orelhas",
      "Escove antes do banho para remover nós",
      "Proteja olhos e ouvidos durante o banho",
    ],
  },
  {
    id: "4",
    category: "grooming",
    title: "Escovação Diária",
    description: "Pelagem dupla requer escovação diária para evitar nós e embaraços",
    frequency: "Diariamente",
    tips: [
      "Escove pelo menos uma vez ao dia",
      "A escova correta para o Spitz Alemão é a Escova de Pinos Sem Bolinhas (ou Sem Ponta), especialmente durante a troca de pelos",
      "Fluido desembaraçador: ajuda a soltar nós, facilita a escovação e reduz a quebra dos fios, mantendo a pelagem do Spitz Alemão macia, alinhada e saudável. Deve ser usado antes da escovação",
      "Use escova adequada para pelagem dupla",
      "Fique atento a nós e embaraços",
      "Durante a troca de pelo, escove 2x ao dia",
      "Escovação previne bolas de pelo",
    ],
  },
  {
    id: "5",
    category: "grooming",
    title: "Tosa Higiênica",
    description: "Apara pelos das patas, orelhas e região íntima",
    frequency: "A cada 6-8 semanas",
    tips: [
      "Mantenha pelos das patas aparados",
      "Apare pelos ao redor das orelhas",
      "Região íntima deve ser mantida limpa",
      "Não faça tosa completa - prejudica proteção térmica",
      "Prefira profissional experiente com a raça",
    ],
  },
  {
    id: "6",
    category: "health",
    title: "Cuidados Dentários",
    description: "Escovação regular dos dentes para prevenir problemas bucais",
    frequency: "3-4 vezes por semana",
    tips: [
      "Use pasta de dente específica para cães",
      "Escove dentes 3-4 vezes por semana",
      "Ofereça petiscos dentais",
      "Consulta odontológica anual",
      "Fique atento a mau hálito",
    ],
  },
  {
    id: "7",
    category: "health",
    title: "Vacinação em Dia",
    description: "Calendário completo de vacinas e vermífugos",
    frequency: "Conforme calendário",
    tips: [
      "V8 ou V10: anual",
      "Antirrábica: anual",
      "Gripe canina: anual",
      "Vermífugo: a cada 3-6 meses",
      "Mantenha carteirinha atualizada",
    ],
  },
  {
    id: "8",
    category: "exercise",
    title: "Exercícios Diários",
    description: "Passeios e brincadeiras para manter saúde física e mental",
    frequency: "2-3 vezes ao dia",
    tips: [
      "Passeios de 15-30 minutos, 2-3x ao dia",
      "Brinquedos interativos estimulam a mente",
      "Socialize com outros cães",
      "Evite exercícios em calor extremo",
      "Raça ativa, precisa de estimulação",
    ],
  },
  {
    id: "9",
    category: "health",
    title: "Limpeza de Orelhas",
    description: "Higiene regular para prevenir infecções",
    frequency: "Semanal",
    tips: [
      "Limpe semanalmente com produto específico",
      "Use algodão ou gaze, nunca cotonete",
      "Seque bem após banhos",
      "Observe secreção ou mau cheiro",
      "Procure veterinário se suspeitar de infecção",
    ],
  },
  {
    id: "10",
    category: "health",
    title: "Corte de Unhas",
    description: "Manutenção regular das unhas para conforto e saúde",
    frequency: "A cada 2-4 semanas",
    tips: [
      "Corte a cada 2-4 semanas",
      "Use cortador específico para cães",
      "Evite cortar a parte viva (causa sangramento)",
      "Se inseguro, procure profissional",
      "Unhas longas prejudicam a postura",
    ],
  },
]

const categories = [
  { value: "all", label: "Todos", icon: Heart },
  { value: "food", label: "Alimentação", icon: Utensils },
  { value: "hydration", label: "Hidratação", icon: Droplets },
  { value: "bath", label: "Banho", icon: Bath },
  { value: "grooming", label: "Tosa", icon: Scissors },
  { value: "health", label: "Saúde", icon: Pill },
  { value: "exercise", label: "Exercício", icon: Dog },
] as const

const contactTypes = [
  { value: "veterinario", label: "Veterinário", icon: Stethoscope },
  { value: "clinica", label: "Clínica 24h", icon: Building2 },
  { value: "petshop", label: "Pet Shop", icon: Scissors },
  { value: "outro", label: "Outro", icon: User },
]

const documentTypes = [
  { value: "rg", label: "RG/Pedigree", icon: FileText },
  { value: "vaccine", label: "Carteira de Vacinação", icon: Pill },
  { value: "medical", label: "Histórico Médico", icon: Heart },
  { value: "other", label: "Outro Documento", icon: BookOpen },
]

const tabs = [
  { value: "contacts", label: "Contatos", icon: Phone },
  { value: "documents", label: "Documentos", icon: FileText },
  { value: "guides", label: "Guia", icon: BookOpen },
]

function EssentialsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("contacts")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEssential, setSelectedEssential] = useState<Essential | null>(null)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [documents, setDocuments] = useState<DogDocument[]>([])
  const [dogs, setDogs] = useState<Array<{ id: string; name: string }>>([])
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [editingDocument, setEditingDocument] = useState<DogDocument | null>(null)

  useEffect(() => {
    const storedContacts = localStorage.getItem("meevi_emergency_contacts")
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts))
    }

    const storedDocuments = localStorage.getItem("meevi_dog_documents")
    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments))
    }

    const storedDogs = localStorage.getItem("dogs")
    if (storedDogs) {
      setDogs(JSON.parse(storedDogs))
    }
  }, [])

  useEffect(() => {
    if (showDocumentDialog || showContactDialog) {
      const storedDogs = localStorage.getItem("dogs")
      if (storedDogs) {
        setDogs(JSON.parse(storedDogs))
      }
    }
  }, [showDocumentDialog, showContactDialog])

  const saveContact = (contact: Omit<EmergencyContact, "id">) => {
    const newContact = {
      ...contact,
      id: Date.now().toString(),
    }
    const updated = [...contacts, newContact]
    setContacts(updated)
    localStorage.setItem("meevi_emergency_contacts", JSON.stringify(updated))
  }

  const updateContact = (id: string, contact: Partial<EmergencyContact>) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, ...contact } : c))
    setContacts(updated)
    localStorage.setItem("meevi_emergency_contacts", JSON.stringify(updated))
  }

  const deleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id)
    setContacts(updated)
    localStorage.setItem("meevi_emergency_contacts", JSON.stringify(updated))
  }

  const saveDocument = (doc: Omit<DogDocument, "id">) => {
    const newDoc = {
      ...doc,
      id: Date.now().toString(),
    }
    const updated = [...documents, newDoc]
    setDocuments(updated)
    localStorage.setItem("meevi_dog_documents", JSON.stringify(updated))
  }

  const updateDocument = (id: string, doc: Partial<DogDocument>) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, ...doc } : d))
    setDocuments(updated)
    localStorage.setItem("meevi_dog_documents", JSON.stringify(updated))
  }

  const deleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id)
    setDocuments(updated)
    localStorage.setItem("meevi_dog_documents", JSON.stringify(updated))
  }

  const filteredEssentials = essentials.filter((essential) => {
    const matchesCategory = selectedCategory === "all" || essential.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      essential.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      essential.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">Essenciais</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Contatos, documentos e cuidados</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 sm:mt-4 overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.value as typeof activeTab)}
                  className="flex-shrink-0 text-xs sm:text-sm"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {activeTab === "contacts" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold">Contatos de Emergência</h3>
            <Button onClick={() => setShowContactDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Adicionar</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-16">
              <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum contato cadastrado</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Adicione contatos de veterinários e clínicas para emergências
              </p>
              <Button onClick={() => setShowContactDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Contato
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {contacts.map((contact) => {
                const typeInfo = contactTypes.find((t) => t.value === contact.type)
                const Icon = typeInfo?.icon || User
                return (
                  <Card key={contact.id} className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm truncate">{contact.name}</h4>
                              {contact.is24h && (
                                <span className="text-[10px] sm:text-xs bg-green-500/10 text-green-600 px-1.5 sm:px-2 py-0.5 rounded-md font-medium w-fit">
                                  24h
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{typeInfo?.label}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                            {contact.address && (
                              <div className="flex items-start gap-2 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{contact.address}</p>
                              </div>
                            )}
                            {contact.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">{contact.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingContact(contact)
                                setShowContactDialog(true)
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteContact(contact.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold">Documentos dos Cachorros</h3>
            <Button onClick={() => setShowDocumentDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Adicionar</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento cadastrado</h3>
              <p className="text-muted-foreground text-sm mb-4">Adicione documentos importantes dos seus cachorros</p>
              <Button onClick={() => setShowDocumentDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Documento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {dogs.map((dog) => {
                const dogDocs = documents.filter((d) => d.dogId === dog.id)
                if (dogDocs.length === 0) return null

                return (
                  <div key={dog.id}>
                    <h4 className="font-semibold text-sm sm:text-base text-primary mb-2 sm:mb-3">{dog.name}</h4>
                    <div className="grid gap-3">
                      {dogDocs.map((doc) => {
                        const typeInfo = documentTypes.find((t) => t.value === doc.type)
                        const Icon = typeInfo?.icon || FileText
                        return (
                          <Card key={doc.id} className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-xs sm:text-sm truncate">{doc.title}</h4>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                      {typeInfo?.label}
                                    </p>
                                    {doc.description && (
                                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2">
                                        {doc.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span className="text-xs sm:text-sm text-muted-foreground">
                                        {new Date(doc.date).toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                    {doc.notes && (
                                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic">
                                        {doc.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingDocument(doc)
                                        setShowDocumentDialog(true)
                                      }}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === "guides" && (
        <>
          {/* Search */}
          <div className="px-3 sm:px-4 md:px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuidados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-3 sm:px-4 md:px-6 pb-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="text-xs sm:text-sm justify-start sm:justify-center"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {category.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Essentials Grid */}
          <div className="px-3 sm:px-4 md:px-6 pb-4">
            {filteredEssentials.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum resultado</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Tente buscar com outros termos</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-3">
                {filteredEssentials.map((essential) => {
                  const Icon = categories.find((c) => c.value === essential.category)?.icon || Heart
                  return (
                    <Card
                      key={essential.id}
                      className="p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedEssential(essential)}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm truncate">{essential.title}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                {essential.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium">
                                  {essential.frequency}
                                </span>
                                {essential.warnings && (
                                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      <ContactDialog
        open={showContactDialog}
        onOpenChange={(open) => {
          setShowContactDialog(open)
          if (!open) setEditingContact(null)
        }}
        contact={editingContact}
        onSave={(contact) => {
          if (editingContact) {
            updateContact(editingContact.id, contact)
          } else {
            saveContact(contact)
          }
          setShowContactDialog(false)
          setEditingContact(null)
        }}
      />

      <DocumentDialog
        open={showDocumentDialog}
        onOpenChange={(open) => {
          setShowDocumentDialog(open)
          if (!open) setEditingDocument(null)
        }}
        document={editingDocument}
        dogs={dogs}
        onSave={(doc) => {
          if (editingDocument) {
            updateDocument(editingDocument.id, doc)
          } else {
            saveDocument(doc)
          }
          setShowDocumentDialog(false)
          setEditingDocument(null)
        }}
      />

      {/* Detail Dialog */}
      {selectedEssential && (
        <EssentialDetailDialog
          essential={selectedEssential}
          open={!!selectedEssential}
          onOpenChange={(open) => !open && setSelectedEssential(null)}
        />
      )}
    </div>
  )
}

function ContactDialog({
  open,
  onOpenChange,
  contact,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: EmergencyContact | null
  onSave: (contact: Omit<EmergencyContact, "id">) => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    type: "veterinario" as EmergencyContact["type"],
    is24h: false,
  })

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        phone: contact.phone,
        address: contact.address || "",
        type: contact.type,
        is24h: contact.is24h || false,
      })
    } else {
      setFormData({
        name: "",
        phone: "",
        address: "",
        type: "veterinario",
        is24h: false,
      })
    }
  }, [contact, open])

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) return
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar Contato" : "Adicionar Contato"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Clínica Veterinária Pet Care"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: (11) 98765-4321"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as EmergencyContact["type"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veterinario">Veterinário</SelectItem>
                <SelectItem value="clinica">Clínica 24h</SelectItem>
                <SelectItem value="petshop">Pet Shop</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is24h"
              checked={formData.is24h}
              onChange={(e) => setFormData({ ...formData, is24h: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="is24h" className="cursor-pointer">
              Atendimento 24 horas
            </Label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.phone} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DocumentDialog({
  open,
  onOpenChange,
  document,
  dogs,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: DogDocument | null
  dogs: Array<{ id: string; name: string }>
  onSave: (doc: Omit<DogDocument, "id">) => void
}) {
  const [formData, setFormData] = useState({
    dogId: "",
    type: "rg" as DogDocument["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  useEffect(() => {
    if (document) {
      setFormData({
        dogId: document.dogId,
        type: document.type,
        title: document.title,
        description: document.description || "",
        date: document.date,
        notes: document.notes || "",
      })
    } else {
      setFormData({
        dogId: "",
        type: "rg",
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })
    }
  }, [document, open, dogs])

  const handleSubmit = () => {
    if (!formData.dogId || formData.dogId === "all") {
      alert("Por favor, selecione um cachorro específico para vincular o documento")
      return
    }

    if (!formData.title) {
      alert("Por favor, preencha o título do documento")
      return
    }

    onSave(formData)

    // Close dialog after saving
    onOpenChange(false)

    // Reset form
    setFormData({
      dogId: "",
      type: "rg",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Editar Documento" : "Adicionar Documento"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="dogId">Cachorro *</Label>
            <Select value={formData.dogId} onValueChange={(value) => setFormData({ ...formData, dogId: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cachorro" />
              </SelectTrigger>
              <SelectContent>
                {dogs.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">Nenhum cachorro cadastrado</div>
                ) : (
                  dogs.map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {dogs.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre um cachorro primeiro na aba "Seus Cachorros"
              </p>
            )}
          </div>

          <div>
            <Label>Tipo de Documento</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {documentTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.type === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: type.value as DogDocument["type"] })}
                    className="justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="RG Pet, Carteira de Vacinação..."
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre o documento..."
            />
          </div>

          <div>
            <Label htmlFor="date">Data do Documento</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais..."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.dogId || formData.dogId === "all" || !formData.title}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EssentialsSection
