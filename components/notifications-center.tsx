"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/lib/hooks/use-supabase-data"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NotificationsCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsCenter({ open, onOpenChange }: NotificationsCenterProps) {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteNotification(id)
    setDeletingId(null)
  }

  const getNotificationIcon = (type: string) => {
    const icons = {
      vaccine: "💉",
      feeding: "🍖",
      bath: "🛁",
      exercise: "🏃",
      event: "📅",
      birthday: "🎂",
    }
    return icons[type as keyof typeof icons] || "🔔"
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      vaccine: "bg-green-500/10 text-green-600",
      feeding: "bg-blue-500/10 text-blue-600",
      bath: "bg-purple-500/10 text-purple-600",
      exercise: "bg-orange-500/10 text-orange-600",
      event: "bg-pink-500/10 text-pink-600",
      birthday: "bg-yellow-500/10 text-yellow-600",
    }
    return colors[type as keyof typeof colors] || "bg-gray-500/10 text-gray-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Tudo em dia!</p>
                <p className="text-xs text-muted-foreground">Você não tem notificações pendentes</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 transition-all hover:shadow-md ${
                    !notification.is_read ? "border-primary/50 bg-primary/5" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deletingId === notification.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
