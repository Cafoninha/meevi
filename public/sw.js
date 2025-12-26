// Service Worker para PWA do Meevi
const CACHE_NAME = "meevi-v1"
const STATIC_ASSETS = ["/", "/icon-192x192.jpg", "/icon-512x512.jpg", "/apple-icon.png", "/meevi-logo-new.png"]

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("[Meevi SW] Installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Meevi SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Meevi SW] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[Meevi SW] Deleting old cache:", name)
            return caches.delete(name)
          }),
      )
    }),
  )
  self.clients.claim()
})

// Estratégia de cache: Network First, fallback to Cache
self.addEventListener("fetch", (event) => {
  // Pular requisições que não sejam GET
  if (event.request.method !== "GET") return

  // Pular requisições de API e Supabase
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("vercel-storage.com")
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta antes de cachear
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      })
      .catch(() => {
        // Se falhar, buscar do cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Retornar página offline se não houver cache
          return caches.match("/")
        })
      }),
  )
})

// Listener para Push Notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "Meevi"
  const options = {
    body: data.body || "Nova notificação do Meevi",
    icon: "/icon-192x192.jpg",
    badge: "/icon-192x192.jpg",
    vibrate: [200, 100, 200],
    data: data.url || "/",
    actions: [
      {
        action: "open",
        title: "Abrir App",
      },
      {
        action: "close",
        title: "Fechar",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Listener para clique em notificações
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data || "/"))
  }
})
