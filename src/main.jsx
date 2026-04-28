import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // 👈 changed
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { RatingsProvider } from './context/RatingsContext.jsx'
import { ResourceProvider } from './context/ResourceContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* 👈 changed */}
      <ThemeProvider>
        <AuthProvider>
          <RatingsProvider>
            <ResourceProvider>
              <App />
            </ResourceProvider>
          </RatingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)