import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { processQueue, getQueueCount } from './services/offlineQueue'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ─── Service Worker Registration ────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('[SW] Service Worker registered:', registration.scope)

      // Listen for messages from the Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'ONLINE') {
          // Back online — process the offline queue
          console.log('[SW] Back online — syncing offline queue...')
          const token = localStorage.getItem('wits_quest_jwt_token')
          processQueue(token).then((synced) => {
            if (synced > 0) {
              console.log(`[SW] Synced ${synced} offline check-ins`)
            }
          })
        }
      })
    } catch (err) {
      console.warn('[SW] Service Worker registration failed:', err)
    }
  })
}

// ─── Browser Online/Offline Events ──────────────────────────────
window.addEventListener('online', async () => {
  console.log('[App] Browser reports: ONLINE')
  const count = await getQueueCount()
  if (count > 0) {
    console.log(`[App] ${count} pending check-ins — syncing...`)
    const token = localStorage.getItem('wits_quest_jwt_token')
    const synced = await processQueue(token)
    console.log(`[App] Synced ${synced}/${count} check-ins`)
  }
})

window.addEventListener('offline', () => {
  console.log('[App] Browser reports: OFFLINE — actions will be queued')
})
