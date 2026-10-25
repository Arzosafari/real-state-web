import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from '@/App'
import { AuthProvider } from '@/context/AuthContext'
import { SiteProvider } from '@/context/SiteContext'
import '@/styles/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SiteProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SiteProvider>
  </React.StrictMode>,
)
