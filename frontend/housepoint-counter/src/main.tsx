import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './pages/error/ErrorBoundary'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID = "484730115359-bgorqn3ic46235degm71egndjdga1gur.apps.googleusercontent.com"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
