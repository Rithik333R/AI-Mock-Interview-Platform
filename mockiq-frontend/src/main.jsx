import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import useAuthStore from '@/store/authStore'
import App from './App'
import './index.css'

useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)