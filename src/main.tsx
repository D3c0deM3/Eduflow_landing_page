import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isLoginRoute = normalizedPath === '/login';
const isDashboardRoute = normalizedPath === '/dashboard';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLoginRoute ? <LoginPage /> : isDashboardRoute ? <DashboardPage /> : <App />}
  </StrictMode>,
)
