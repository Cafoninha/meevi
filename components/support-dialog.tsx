"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SupportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  const supportEmail = "dmndkennel@gmail.com"

  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Suporte
          </DialogTitle>
          <DialogDescription>Entre em contato conosco para qualquer dúvida ou sugestão</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Email de Suporte</p>
            <a href={`mailto:${supportEmail}`} className="text-lg font-semibold text-primary hover:underline">
              {supportEmail}
            </a>
          </div>

          <Button onClick={handleEmailClick} className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
