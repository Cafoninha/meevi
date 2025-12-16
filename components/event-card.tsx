"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Syringe,
  Stethoscope,
  Scissors,
  Pill,
  Bell,
  Calendar,
  MoreVertical,
  Trash2,
  Clock,
  Repeat,
  Check,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CalendarEvent } from "@/components/calendar-section"
import { cn } from "@/lib/utils"

const iconMap = {
  vaccine: Syringe,
  vet: Stethoscope,
  grooming: Scissors,
  medication: Pill,
  reminder: Bell,
  other: Calendar,
}

const typeLabels = {
  vaccine: "Vacina",
  vet: "Veterinário",
  grooming: "Banho/Tosa",
  medication: "Medicação",
  reminder: "Lembrete",
  other: "Outro",
}

const repeatLabels = {
  none: "Não repete",
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
}

interface EventCardProps {
  event: CalendarEvent
  onDelete: (id: string) => void
  onComplete?: (id: string) => void
  isPast?: boolean
  isCompleted?: boolean
}

export function EventCard({ event, onDelete, onComplete, isPast = false, isCompleted = false }: EventCardProps) {
  const Icon = iconMap[event.type]
  const dateObj = new Date(event.date + "T00:00:00")
  const formattedDate = dateObj.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })

  return (
    <Card
      className={cn("p-4 transition-all", isPast && "opacity-60", isCompleted && "bg-green-500/5 border-green-500/20")}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isCompleted ? "bg-green-500/20" : "bg-primary/10",
          )}
        >
          {isCompleted ? <Check className="w-5 h-5 text-green-600" /> : <Icon className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn("font-semibold text-sm", isCompleted && "line-through text-muted-foreground")}>
                {event.title}
              </h4>
              {event.dogName && <p className="text-xs text-primary font-medium mt-0.5">{event.dogName}</p>}
              {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formattedDate} às {event.time}
                </Badge>
                {event.repeat && event.repeat !== "none" && (
                  <Badge variant="outline" className="text-xs">
                    <Repeat className="w-3 h-3 mr-1" />
                    {repeatLabels[event.repeat]}
                  </Badge>
                )}
                {event.notifyBefore && (
                  <Badge variant="outline" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    {event.notifyBefore >= 1440
                      ? `${event.notifyBefore / 1440}d antes`
                      : event.notifyBefore >= 60
                        ? `${event.notifyBefore / 60}h antes`
                        : `${event.notifyBefore}m antes`}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isCompleted && onComplete && (
                  <DropdownMenuItem onClick={() => onComplete(event.id)} className="text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    Concluir
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  )
}
