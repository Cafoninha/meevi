"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Utensils, Bath, Scissors, Pill, Droplets, Dog, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import type { Essential } from "@/components/essentials-section"

const iconMap = {
  food: Utensils,
  bath: Bath,
  grooming: Scissors,
  health: Pill,
  hydration: Droplets,
  exercise: Dog,
}

interface EssentialDetailDialogProps {
  essential: Essential
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EssentialDetailDialog({ essential, open, onOpenChange }: EssentialDetailDialogProps) {
  const Icon = iconMap[essential.category]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{essential.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{essential.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Frequency */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Frequência Recomendada</p>
              <p className="text-sm text-muted-foreground">{"Pelo menos 3 vezes por semana, mas o ideal é que seja diária"}</p>
            </div>
          </div>

          {/* Tips */}
          {essential.tips && essential.tips.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Dicas Importantes</h3>
              </div>
              <ul className="space-y-2">
                {essential.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {essential.warnings && essential.warnings.length > 0 && (
            <div className="space-y-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-destructive">Atenção</h3>
              </div>
              <ul className="space-y-2">
                {essential.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action */}
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
