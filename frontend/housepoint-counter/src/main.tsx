import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './pages/error/ErrorBoundary'
import { GoogleOAuthProvider } from '@react-oauth/google'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const CLIENT_ID = googleClientId // NOTE TO FUTURE ME: do not upload the id to gh again. This is a public repo.


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
