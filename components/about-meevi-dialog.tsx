"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart } from "lucide-react"
import Image from "next/image"

interface AboutMeeviDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutMeeviDialog({ open, onOpenChange }: AboutMeeviDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Image src="/meevi-logo-new.png" alt="Meevi Logo" width={120} height={120} className="object-contain" />
          </div>
          <DialogTitle className="text-2xl text-center">Sobre o Meevi</DialogTitle>
          <DialogDescription className="text-center">
            O app definitivo para donos e criadores de Spitz Alemão
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            <p className="text-foreground">
              <strong>Meevi</strong> é o app definitivo para donos e criadores de Spitz Alemão — um organizador prático
              que reúne cuidados, rotina e histórico do seu cão em um só lugar. Meevi ajuda você a cuidar do seu Spitz
              Alemão com simplicidade: diário de saúde e peso, calendário de vacinas e banhos, guias de grooming e
              alimentação. Tudo baseado em regras e conteúdo especialista para entregar recomendações claras, lembretes
              confiáveis e um histórico que facilita decisões com o veterinário.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Recursos Principais
              </h4>

              <div className="pl-6 space-y-2">
                <p className="text-foreground">
                  <strong>• Diário completo:</strong> Peso, alimentação, grooming e consultas.
                </p>

                <p className="text-foreground">
                  <strong>• Alertas e calendário:</strong> Lembretes configuráveis para vacinas, banho, vermífugo e
                  medicação.
                </p>

                <p className="text-foreground">
                  <strong>• Central de conhecimento:</strong> Guias práticos sobre pelagem, comportamento e primeiros
                  socorros.
                </p>

                <p className="text-foreground">
                  <strong>• Ideal para criadores:</strong> Múltiplos perfis, controle de ninhadas e exportação de
                  relatórios.
                </p>
              </div>
            </div>

            <div className="pt-4 pb-2 text-center">
              <p className="text-primary font-semibold text-base">
                Comece cadastrando seu Spitz — Meevi cuida do resto.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
