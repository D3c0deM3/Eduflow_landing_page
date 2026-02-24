import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  LogOut,
  TrendingUp,
  Users,
  FileCheck,
  Mic,
  Calendar,
  Bell,
  Search,
  Menu,
  ChevronRight,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiUrl } from '../lib/api';
import { clearAuthSession, getAuthToken, getAuthUser, type PlatformAccess } from '../lib/auth';

/* ------------------------------------------------------------------ */
/*  Theme tokens                                                      */
/* ------------------------------------------------------------------ */
type Theme = 'dark' | 'light';

const THEME_KEY = 'eduflow_dashboard_theme';

const themes = {
  dark: {
    bg: 'bg-[#0B0C10]',
    sidebarBg: 'bg-[#0d0e13]',
    headerBg: 'bg-[#0d0e13]/80',
    textPrimary: 'text-[#F7F7F8]',
    textSecondary: 'text-[#A7B0B8]',
    textSecondaryMuted: 'text-[#A7B0B8]/60',
    border: 'border-white/[0.06]',
    cardBg: 'bg-white/[0.02]',
    cardHover: 'hover:bg-white/[0.04]',
    inputBg: 'bg-white/[0.03]',
    inputBorder: 'border-white/10',
    btnBg: 'bg-white/5',
    btnHover: 'hover:bg-white/10',
    navActive: 'bg-eduflow-cyan/[0.12] text-eduflow-cyan',
    navInactive: 'text-[#A7B0B8] hover:bg-white/[0.04] hover:text-[#F7F7F8]',
    overlay: 'bg-black/60',
    innerCard: 'bg-white/[0.03] border-white/[0.04]',
    iconBox: 'bg-white/[0.05]',
    barTrack: 'bg-white/[0.06]',
    divider: 'divide-white/[0.04]',
    tooltipBg: '#161822',
    tooltipBorder: 'rgba(255,255,255,0.1)',
    tooltipText: '#F7F7F8',
    tooltipLabel: '#A7B0B8',
    gridStroke: 'rgba(255,255,255,0.04)',
    axisTick: '#A7B0B8',
    chartAccent: '#00F0FF',
    barFill: '#00F0FF',
    areaGradientStart: 'rgba(0,240,255,0.3)',
    areaGradientEnd: 'rgba(0,240,255,0)',
    logoText: 'text-[#0B0C10]',
    placeholderColor: 'placeholder:text-[#A7B0B8]/60',
  },
  light: {
    bg: 'bg-[#F5F6FA]',
    sidebarBg: 'bg-white',
    headerBg: 'bg-white/80',
    textPrimary: 'text-[#1A1D26]',
    textSecondary: 'text-[#64748B]',
    textSecondaryMuted: 'text-[#64748B]/60',
    border: 'border-[#E2E8F0]',
    cardBg: 'bg-white',
    cardHover: 'hover:bg-[#F8FAFC]',
    inputBg: 'bg-[#F1F5F9]',
    inputBorder: 'border-[#E2E8F0]',
    btnBg: 'bg-[#F1F5F9]',
    btnHover: 'hover:bg-[#E2E8F0]',
    navActive: 'bg-[#0891B2]/10 text-[#0891B2]',
    navInactive: 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1D26]',
    overlay: 'bg-black/30',
    innerCard: 'bg-[#F8FAFC] border-[#E2E8F0]',
    iconBox: 'bg-[#F1F5F9]',
    barTrack: 'bg-[#E2E8F0]',
    divider: 'divide-[#E2E8F0]',
    tooltipBg: '#FFFFFF',
    tooltipBorder: 'rgba(0,0,0,0.08)',
    tooltipText: '#1A1D26',
    tooltipLabel: '#64748B',
    gridStroke: 'rgba(0,0,0,0.06)',
    axisTick: '#64748B',
    chartAccent: '#0891B2',
    barFill: '#0891B2',
    areaGradientStart: 'rgba(8,145,178,0.25)',
    areaGradientEnd: 'rgba(8,145,178,0)',
    logoText: 'text-white',
    placeholderColor: 'placeholder:text-[#94A3B8]',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Types for CRM dashboard data                                      */
/* ------------------------------------------------------------------ */

type DashboardStats = {
  totalStudents: number;
  activeClasses: number;
  monthlyRevenue: number;
  outstandingDebt: number;
};

type EnrollmentPoint = { month: string; students: number };
type PaymentPoint    = { month: string; total: number };
type StatusSlice     = { name: string; value: number; color: string };
type OverviewItem    = { label: string; value: number };
type UpcomingEvent   = { id: number; title: string; subtitle: string; time: string; date: string; students?: number; durationMin?: number };
type ActivityItem    = { type: string; name: string; ref: string; amount: number | null; time: string };

const ALL_NAV_ITEMS = [
  { icon: TrendingUp, label: 'Overview',      id: 'overview',  platform: null            },
  { icon: Users,      label: 'CRM',           id: 'crm',       platform: 'crm'           },
  { icon: FileCheck,  label: 'Exams',         id: 'exams',     platform: 'cdi'           },
  { icon: Mic,        label: 'Speaking',      id: 'speaking',  platform: 'cefr_speaking' },
  { icon: Calendar,   label: 'Schedule',      id: 'schedule',  platform: null            },
  { icon: BookOpen,   label: 'Courses',       id: 'courses',   platform: 'cdi'           },
  { icon: BarChart3,  label: 'Reports',       id: 'reports',   platform: null            },
] as const;

const NAV_BOTTOM = [
  { icon: Settings, label: 'Settings', id: 'settings' },
  { icon: HelpCircle, label: 'Help', id: 'help' },
] as const;

/* ------------------------------------------------------------------ */
/*  Custom chart tooltip                                              */
/* ------------------------------------------------------------------ */
const ChartTooltip = ({
  active,
  payload,
  label,
  valueLabel,
  theme,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  valueLabel?: string;
  theme: Theme;
}) => {
  if (!active || !payload?.length) return null;
  const t = themes[theme];
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}` }}
    >
      <p className="mb-1" style={{ color: t.tooltipLabel }}>{label}</p>
      <p className="font-semibold" style={{ color: t.tooltipText }}>
        {payload[0].value} {valueLabel}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
const DashboardPage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLogin, setUserLogin] = useState('Admin');
  const [userInitials, setUserInitials] = useState('AD');
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [platformAccess, setPlatformAccess] = useState<PlatformAccess | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const t = themes[theme];

  /* ---- CRM dashboard data state ---- */
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeClasses: 0,
    monthlyRevenue: 0,
    outstandingDebt: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentPoint[]>([]);
  const [paymentsData, setPaymentsData]     = useState<PaymentPoint[]>([]);
  const [studentStatus, setStudentStatus]   = useState<StatusSlice[]>([]);
  const [studentOverview, setStudentOverview] = useState<OverviewItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
  };

  /* ---- Refresh permissions from the server (called on mount + on nav click) ---- */
  const refreshPermissions = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = await response.json() as {
        user?: { platformAccess?: { crm: boolean; cdi: boolean; cefr_speaking: boolean } };
      };
      if (data.user?.platformAccess) {
        setPlatformAccess(data.user.platformAccess);
        const stored = getAuthUser();
        if (stored) {
          try {
            localStorage.setItem('eduflow_user', JSON.stringify({ ...stored, platformAccess: data.user.platformAccess }));
          } catch { /* ignore */ }
        }
      }
    } catch { /* network error – ignore */ }
  };

  /* ---- Auth check on mount (runs once) ---- */
  useEffect(() => {
    const token = getAuthToken();
    const user  = getAuthUser();

    if (user?.login) {
      const name = user.displayName || user.login;
      setUserLogin(name);
      setUserInitials(
        user.displayName
          ? user.displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
          : user.login.slice(0, 2).toUpperCase()
      );
    }

    // Paint sidebar instantly from localStorage while the first fetch is in-flight
    setPlatformAccess(user?.platformAccess ?? null);

    if (!token) {
      window.location.replace('/login');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const response = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (cancelled) return;
        if (!response.ok) throw new Error('Session expired.');
        const data = await response.json() as {
          user?: { platformAccess?: { crm: boolean; cdi: boolean; cefr_speaking: boolean } };
        };
        if (cancelled) return;
        if (data.user?.platformAccess) {
          setPlatformAccess(data.user.platformAccess);
          const stored = getAuthUser();
          if (stored) {
            try {
              localStorage.setItem('eduflow_user', JSON.stringify({ ...stored, platformAccess: data.user.platformAccess }));
            } catch { /* ignore */ }
          }
        }
        setError(null);
      } catch (err) {
        if (cancelled) return;
        clearAuthSession();
        setError(err instanceof Error ? err.message : 'Unable to verify session.');
        window.location.replace('/login');
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    void verify();
    return () => { cancelled = true; };
  }, []);

  /* ---- fetch CRM dashboard data (runs once auth is confirmed) ---- */
  useEffect(() => {
    if (isChecking) return;          // wait until auth is done
    const token = getAuthToken();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      setDataLoading(true);
      try {
        const [statsRes, enrollRes, paymentsRes, statusRes, overviewRes, upcomingRes, activityRes] =
          await Promise.all([
            fetch(apiUrl('/api/dashboard/stats'), { headers }),
            fetch(apiUrl('/api/dashboard/enrollment-trend'), { headers }),
            fetch(apiUrl('/api/dashboard/payments-trend'), { headers }),
            fetch(apiUrl('/api/dashboard/student-status'), { headers }),
            fetch(apiUrl('/api/dashboard/student-overview'), { headers }),
            fetch(apiUrl('/api/dashboard/upcoming'), { headers }),
            fetch(apiUrl('/api/dashboard/recent-activity'), { headers }),
          ]);

        if (statsRes.ok)    setStats(await statsRes.json());
        if (enrollRes.ok)   setEnrollmentData(await enrollRes.json());
        if (paymentsRes.ok) setPaymentsData(await paymentsRes.json());
        if (statusRes.ok)   setStudentStatus(await statusRes.json());
        if (overviewRes.ok) setStudentOverview(await overviewRes.json());
        if (upcomingRes.ok) setUpcomingEvents(await upcomingRes.json());
        if (activityRes.ok) setRecentActivity(await activityRes.json());
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setDataLoading(false);
      }
    };

    void fetchAll();
  }, [isChecking]);

  const handleLogout = () => {
    clearAuthSession();
    window.location.assign('/login');
  };

  /* ---- loading / error states ---- */
  if (isChecking) {
    return (
      <main className={`min-h-screen ${t.bg} ${t.textPrimary} flex items-center justify-center`}>
        <div className={`rounded-xl ${t.border} border ${t.cardBg} px-6 py-4 text-sm ${t.textSecondary} backdrop-blur`}>
          Verifying session…
        </div>
      </main>
    );
  }

  if (error) return null;

  /* ---- render ---- */
  return (
    <div className={`flex h-screen ${t.bg} ${t.textPrimary} overflow-hidden transition-colors duration-300`}>
      {/* ===== Mobile sidebar overlay ===== */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-40 ${t.overlay} lg:hidden`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r ${t.border} ${t.sidebarBg}
          transition-all duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eduflow-cyan to-eduflow-purple flex items-center justify-center">
              <span className={`${t.logoText} font-bold text-sm`}>E</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">EduFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-lg ${t.btnHover} lg:hidden`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-0.5 mt-2 overflow-y-auto">
          {ALL_NAV_ITEMS.filter((item) => {
            if (!item.platform) return true; // always visible
            if (!platformAccess) return false; // no access info yet → hide gated items
            return platformAccess[item.platform as keyof PlatformAccess] === true;
          }).map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                  void refreshPermissions();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  active ? t.navActive : t.navInactive
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className={`px-3 pb-4 space-y-0.5 border-t ${t.border} pt-3`}>
          {NAV_BOTTOM.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium ${t.navInactive} transition-colors`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top bar ── */}
        <header className={`flex items-center justify-between gap-4 px-4 lg:px-8 py-3 border-b ${t.border} ${t.headerBg} backdrop-blur-sm flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} transition-colors lg:hidden`}
            >
              <Menu className={`w-5 h-5 ${t.textSecondary}`} />
            </button>
            <div className={`hidden sm:flex items-center gap-2 rounded-xl border ${t.inputBorder} ${t.inputBg} px-3 py-2 w-64`}>
              <Search className={`w-4 h-4 ${t.textSecondary}`} />
              <input
                type="text"
                placeholder="Search students, courses…"
                className={`bg-transparent text-sm outline-none w-full ${t.placeholderColor}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} transition-colors`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className={`w-[18px] h-[18px] ${t.textSecondary}`} />
              ) : (
                <Moon className={`w-[18px] h-[18px] ${t.textSecondary}`} />
              )}
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border ${t.inputBorder} ${t.btnBg} px-3 py-2 text-xs ${t.textSecondary} ${t.btnHover} transition-colors`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
            <button className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} transition-colors relative`}>
              <Bell className={`w-[18px] h-[18px] ${t.textSecondary}`} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-eduflow-cyan rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${t.btnBg} ${t.btnHover} transition-colors`}
              title="Logout"
            >
              <LogOut className={`w-[18px] h-[18px] ${t.textSecondary}`} />
            </button>
            <div className="w-8 h-8 rounded-full bg-eduflow-cyan/20 flex items-center justify-center ml-1">
              <span className="text-xs font-medium text-eduflow-cyan">{userInitials}</span>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Welcome banner */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back, {userLogin}
              </h1>
              <p className={`text-sm ${t.textSecondary} mt-1`}>
                Here's what's happening across your school today.
              </p>
            </div>
            <span className={`text-xs ${t.textSecondary} flex items-center gap-1.5`}>
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Students',
                value: dataLoading ? '…' : stats.totalStudents.toLocaleString(),
              },
              {
                label: 'Active Classes',
                value: dataLoading ? '…' : stats.activeClasses.toLocaleString(),
              },
              {
                label: 'Revenue (this month)',
                value: dataLoading ? '…' : `$${stats.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              },
              {
                label: 'Outstanding Debt',
                value: dataLoading ? '…' : `$${stats.outstandingDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                negative: stats.outstandingDebt > 0,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`rounded-2xl border ${t.border} ${t.cardBg} p-5 ${t.cardHover} transition-colors`}
              >
                <p className={`text-xs ${t.textSecondary} mb-2`}>{stat.label}</p>
                <span className={`text-2xl font-bold ${stat.negative ? 'text-red-400' : ''}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Enrollment trend */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Enrollment Trend</h3>
                <span className={`text-[11px] ${t.textSecondary}`}>Last 6 months</span>
              </div>
              <div className="h-52">
                {dataLoading ? (
                  <div className={`h-full ${t.barTrack} rounded-xl animate-pulse`} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrollmentData}>
                    <defs>
                      <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.chartAccent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={t.chartAccent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: t.axisTick, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: t.axisTick, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip content={<ChartTooltip valueLabel="students" theme={theme} />} />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke={t.chartAccent}
                      strokeWidth={2}
                      fill="url(#enrollGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Monthly Revenue</h3>
                <span className={`text-[11px] ${t.textSecondary}`}>Last 8 months</span>
              </div>
              <div className="h-52">
                {dataLoading ? (
                  <div className={`h-full ${t.barTrack} rounded-xl animate-pulse`} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: t.axisTick, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: t.axisTick, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={42}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip valueLabel="USD" theme={theme} />} />
                      <Bar dataKey="total" fill={t.barFill} radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom row ── */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Enrollment funnel */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
              <h3 className="text-sm font-medium mb-4">Student Overview</h3>
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-6 ${t.barTrack} rounded animate-pulse`} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {studentOverview.map((item, i) => {
                    const max = studentOverview[0]?.value || 1;
                    const colors = [
                      theme === 'dark' ? 'bg-eduflow-cyan' : 'bg-[#0891B2]',
                      theme === 'dark' ? 'bg-eduflow-cyan/70' : 'bg-[#0891B2]/70',
                      theme === 'dark' ? 'bg-purple-500/70' : 'bg-purple-500/70',
                      theme === 'dark' ? 'bg-eduflow-purple' : 'bg-purple-600',
                    ];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${t.textSecondary}`}>{item.label}</span>
                          <span className="text-xs font-medium">{item.value.toLocaleString()}</span>
                        </div>
                        <div className={`h-2 ${t.barTrack} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                            style={{ width: `${Math.round((item.value / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Student Status distribution */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Student Status</h3>
                <span className="text-[10px] text-eduflow-cyan font-medium tracking-wide uppercase">
                  Live
                </span>
              </div>
              {dataLoading ? (
                <div className={`h-32 ${t.barTrack} rounded-xl animate-pulse`} />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentStatus}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {studentStatus.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    {studentStatus.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className={`text-xs ${t.textSecondary}`}>{item.name}</span>
                        </div>
                        <span className="text-xs font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Upcoming</h3>
                <button className="text-[11px] text-eduflow-cyan hover:underline flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-14 ${t.barTrack} rounded-xl animate-pulse`} />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <p className={`text-xs ${t.textSecondary} text-center py-6`}>No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`flex items-start gap-3 rounded-xl ${t.innerCard} border p-3`}
                    >
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-eduflow-cyan/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-eduflow-cyan" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{ev.title}</p>
                        <p className={`text-[11px] ${t.textSecondary} mt-0.5`}>
                          {ev.date} · {ev.time}
                          {ev.durationMin ? ` · ${ev.durationMin} min` : ''}
                          {ev.subtitle ? ` · ${ev.subtitle}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Recent activity ── */}
          <div className={`rounded-2xl border ${t.border} ${t.cardBg} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Recent Activity</h3>
              <button className="text-[11px] text-eduflow-cyan hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-10 ${t.barTrack} rounded-xl animate-pulse`} />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className={`text-xs ${t.textSecondary} text-center py-6`}>No recent activity</p>
            ) : (
              <div className={`${t.divider}`}>
                {recentActivity.map((item, idx) => {
                  const Icon = item.type === 'payment' ? FileCheck : Users;
                  const text =
                    item.type === 'payment'
                      ? `${item.name} — payment of $${item.amount?.toLocaleString()} (${item.ref})`
                      : `New student enrolled: ${item.name} (${item.ref})`;
                  return (
                    <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-lg ${t.iconBox} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${t.textSecondary}`} />
                      </div>
                      <p className={`text-xs ${t.textSecondary} flex-1 min-w-0 truncate`}>{text}</p>
                      <span className={`text-[11px] ${t.textSecondaryMuted} flex-shrink-0`}>{item.time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
