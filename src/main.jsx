import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  createRoot(document.getElementById('root')).render(
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui' }}>
      <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>Authentication Setup Required</h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.5 }}>
          Please create a free project at <a href="https://clerk.com" style={{ color: '#38bdf8' }}>clerk.com</a> and add your Publishable Key to your <code>.env.local</code> file as <code>VITE_CLERK_PUBLISHABLE_KEY</code>.
        </p>
      </div>
    </div>
  )
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}
