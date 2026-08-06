import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './Components/ErrorBoundary.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!googleClientId) {
  console.error('ERROR: VITE_GOOGLE_CLIENT_ID environment variable is not set. Please check your .env file.')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId || 'error-missing-client-id'}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
