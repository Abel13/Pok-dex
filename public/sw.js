// Service Worker configurado conforme exemplo oficial PWABuilder
// Estrutura simples usando apenas APIs nativas do Service Worker

const CACHE_NAME = "mybodyhistory-cache";
const offlineFallbackPage = "/offline.html";

// Assets para precachear
const PRECACHE_ASSETS = [
  "/offline.html",
  "/icons/manifest-icon-192.maskable.png",
];

// Listener para o evento install - precacheia assets na instalação do service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);
    })(),
  );
});

// Listener para o evento activate - claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener para o evento fetch - estratégia cache first, depois network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Tentar encontrar no cache
      const cachedResponse = await cache.match(event.request);

      // Se encontrou no cache, retornar
      if (cachedResponse !== undefined) {
        return cachedResponse;
      } else {
        // Caso contrário, ir para a rede
        try {
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Se for navegação e falhar, retornar página offline
          if (event.request.mode === "navigate") {
            const offlinePage = await cache.match(offlineFallbackPage);
            return offlinePage || new Response("Offline", { status: 503 });
          }
          throw error;
        }
      }
    })(),
  );
});

// Push Notifications Handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received", { hasData: !!event.data });

  let notificationData = {
    title: "My Body History",
    body: "Você tem uma nova notificação",
    icon: "/icons/manifest-icon-192.maskable.png",
    badge: "/icons/manifest-icon-192.maskable.png",
    tag: "default",
    requireInteraction: false,
    data: {
      url: "/patient/alerts",
    },
  };

  // Se o push event contém dados, usar eles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        data: {
          url: data.url || "/patient/alerts",
          alertId: data.alertId || null,
        },
      };
    } catch (e) {
      // Se não conseguir parsear JSON, usar texto
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const promiseChain = self.registration
    .showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: notificationData.priority === "high" ? [200, 100, 200] : [200],
      actions: [
        {
          action: "open",
          title: "Abrir",
        },
        {
          action: "close",
          title: "Fechar",
        },
      ],
    })
    .then((result) => {
      console.log("[SW] Notification shown successfully", result);
      return result;
    })
    .catch((err) => {
      console.error("[SW] Error showing notification:", err);
      throw err;
    });

  event.waitUntil(promiseChain);
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  // Se clicou em "Fechar", não fazer nada
  if (action === "close") {
    return;
  }

  // Determinar URL para navegar
  let urlToOpen = notificationData.url || "/patient/alerts";

  // Se tem alertId, navegar para a página de alertas
  if (notificationData.alertId) {
    urlToOpen = `/patient/alerts?alert=${notificationData.alertId}`;
  }

  // Se a URL já é específica (contém /chat/[id]), usar diretamente
  // Caso contrário, usar a URL fornecida ou fallback
  console.log("[SW] Notification click - opening URL:", urlToOpen);

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Verificar se já existe uma janela aberta com a URL exata ou base
      const baseUrl = urlToOpen.split("?")[0]; // Remover query params para comparação
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientBaseUrl = client.url.split("?")[0];
        // Comparar URLs base (sem query params) para permitir focar mesmo com params diferentes
        if (clientBaseUrl === baseUrl && "focus" in client) {
          console.log("[SW] Focusing existing window:", client.url);
          return client.focus();
        }
      }

      // Se não encontrou janela aberta, abrir nova
      console.log("[SW] Opening new window:", urlToOpen);
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});
