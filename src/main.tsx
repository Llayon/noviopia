import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/pixel.css'

const rootEl = document.getElementById('app')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)

const loadingEl = document.getElementById('app-loading')
if (loadingEl) loadingEl.remove()

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
