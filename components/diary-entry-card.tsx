"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Bath, Activity, Heart, Pill, Scissors, MoreVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { DiaryEntry } from "@/components/diary-section"

const iconMap = {
  food: Utensils,
  bath: Bath,
  exercise: Activity,
  health: Heart,
  medication: Pill,
  grooming: Scissors,
  other: Heart,
}

interface DiaryEntryCardProps {
  entry: DiaryEntry
  onDelete: (id: string) => void
}

export function DiaryEntryCard({ entry, onDelete }: DiaryEntryCardProps) {
  const Icon = iconMap[entry.type]

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm truncate">{entry.title}</h4>
              {entry.dogName && (
                <p className="text-[10px] sm:text-xs text-primary font-medium mt-0.5 truncate">{entry.dogName}</p>
              )}
              {entry.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive text-xs sm:text-sm">
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 block">{entry.time}</span>
        </div>
      </div>
    </Card>
  )
}
