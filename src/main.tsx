import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import App from './App.tsx'
import './index.css'
import { applyTheme } from './utils/theme'

applyTheme() // ← اینجا قبل از render

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='font-sans'>
      <App />
      <ToastContainer />
    </div>
  </StrictMode>
)