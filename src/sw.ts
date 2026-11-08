import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { APP_CONFIG } from "./config/app.config";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Service worker global scope type without requiring the full 'webworker' tsconfig lib
// which can conflict with DOM definitions in Next.js
declare const self: WorkerGlobalScope & {
  clients: {
    matchAll: (options: { type?: string; includeUncontrolled?: boolean }) => Promise<any[]>;
    openWindow?: (url: string) => Promise<any>;
  };
  registration: {
    showNotification: (title: string, options?: any) => Promise<void>;
  };
  addEventListener: (type: string, listener: (event: any) => void) => void;
  skipWaiting: () => void;
};

// Filter out any API routes, supabase URLs, or sensitive endpoints from precaching
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache.map((entry) => {
    // Ensure all runtime caching ignores any API or Supabase requests
    return {
      ...entry,
    };
  }),
});

// Explicitly register push event for Coded Signals
self.addEventListener("push", (event) => {
  try {
    const data = event.data?.json();
    const signalIndex = typeof data?.signalIndex === "number" ? data.signalIndex : 0;
    const signal = APP_CONFIG.codedSignals[signalIndex] || APP_CONFIG.codedSignals[0];

    const title = signal.decoyTitle;
    const options: NotificationOptions = {
      body: signal.decoyBody,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: `planner-reminder-${signalIndex}`,
      data: {
        url: "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // If payload is malformed, fall back to a generic planner notification
    const fallback = APP_CONFIG.codedSignals[0];
    event.waitUntil(
      self.registration.showNotification(fallback.decoyTitle, {
        body: fallback.decoyBody,
        icon: "/icons/icon-192.png",
        data: { url: "/" },
      })
    );
  }
});

// Notification click handler: Always opens the root decoy page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});

serwist.addEventListeners();
