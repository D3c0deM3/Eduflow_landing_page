import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isLoginRoute = normalizedPath === '/login';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLoginRoute ? <LoginPage /> : <App />}
  </StrictMode>,
)
