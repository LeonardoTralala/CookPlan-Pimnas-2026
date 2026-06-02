import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlanProvider } from './context/PlanContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <ScrollToTop />
          <App />
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
