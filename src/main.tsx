import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/pixel.css'

const root = createRoot(document.getElementById('app')!)

const loadingEl = document.getElementById('app-loading')
if (loadingEl) loadingEl.remove()

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
