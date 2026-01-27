import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* Wrap with BrowserRouter */}
      <AuthProvider> {/* Wrap with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
