import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import DevLoginPage from './pages/DevLoginPage.tsx'
import DevDashboardPage from './pages/DevDashboardPage.tsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const isLoginRoute        = normalizedPath === '/login';
const isDashboardRoute    = normalizedPath === '/dashboard';
const isDevLoginRoute     = normalizedPath === '/dev-login';
const isDevDashboardRoute = normalizedPath === '/dev-dashboard';

let page = <App />;
if (isLoginRoute) page = <LoginPage />;
else if (isDashboardRoute) page = <DashboardPage />;
else if (isDevLoginRoute) page = <DevLoginPage />;
else if (isDevDashboardRoute) page = <DevDashboardPage />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
