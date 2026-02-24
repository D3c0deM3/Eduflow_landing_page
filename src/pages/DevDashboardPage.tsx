import { useEffect, useState, type FormEvent } from 'react';
import {
  Terminal,
  Users,
  LogOut,
  LayoutDashboard,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Database,
  Lock,
  Building2,
  Globe,
  Mic,
  FileCheck,
  ChevronRight,
  Search,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { apiUrl } from '../lib/api';
import { clearDevSession, getDevToken, getDevUser, type DevUser } from '../lib/auth';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type PlatformAccess = { crm: boolean; cdi: boolean; cefr_speaking: boolean };

type SuperAdmin = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isLocked: boolean;
  lastLogin: string | null;
  createdAt: string;
  centerName: string;
  centerId: number;
  city: string;
  platformAccess: PlatformAccess;
};

type DevStats = {
  totalAdmins: number;
  activeAdmins: number;
  lockedAdmins: number;
  totalCenters: number;
};

type NavId = 'overview' | 'admins';

/* ─────────────────────────────────────────────
   Platform badge
───────────────────────────────────────────── */
const PlatformBadge = ({ active, label, icon: Icon }: { active: boolean; label: string; icon: React.ElementType }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
      active
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563]'
    }`}
  >
    <Icon className="w-3 h-3" />
    {label}
  </span>
);

/* ─────────────────────────────────────────────
   Status badge
───────────────────────────────────────────── */
const StatusBadge = ({ status, locked }: { status: string; locked: boolean }) => {
  if (locked) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 border border-red-500/25 text-red-400"><Lock className="w-3 h-3" />Locked</span>;
  const map: Record<string, string> = {
    Active: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    Inactive: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400',
    Suspended: 'bg-red-500/10 border-red-500/25 text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[status] ?? 'bg-gray-500/10 border-gray-500/25 text-gray-400'}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────
   Create Admin Modal
───────────────────────────────────────────── */
type CreateModalProps = {
  token: string;
  onClose: () => void;
  onCreated: (admin: SuperAdmin) => void;
};

const CreateAdminModal = ({ token, onClose, onCreated }: CreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformAccess>({ crm: false, cdi: false, cefr_speaking: false });

  const togglePlatform = (key: keyof PlatformAccess) => {
    setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      username: fd.get('username') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
      companyName: fd.get('companyName') as string,
      city: fd.get('city') as string,
      phone: fd.get('phone') as string,
      plan: fd.get('plan') as string,
      platformAccess: platforms,
    };

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(apiUrl('/api/dev/superadmins'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to create admin.');

      onCreated(data as SuperAdmin);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-xl border px-3 py-2.5 text-sm bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#F7F7F8] outline-none focus:border-purple-500/50 placeholder:text-gray-600 transition-colors';
  const labelClass = 'block text-xs text-[#9CA3AF] mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{ background: '#0E0F14', borderColor: 'rgba(255,255,255,0.08)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-[#F7F7F8]">Create Superadmin Account</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Set up a new admin with platform access</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input name="firstName" type="text" className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input name="lastName" type="text" className={inputClass} placeholder="Smith" />
            </div>
            <div>
              <label className={labelClass}>Username *</label>
              <input name="username" type="text" required className={inputClass} placeholder="johnsmith" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" className={inputClass} placeholder="john@company.com" />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input name="password" type="password" required minLength={6} className={inputClass} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" type="tel" className={inputClass} placeholder="+1 555 0100" />
            </div>
            <div>
              <label className={labelClass}>Company / Center Name *</label>
              <input name="companyName" type="text" required className={inputClass} placeholder="Acme Language Center" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input name="city" type="text" className={inputClass} placeholder="New York" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Plan</label>
              <select name="plan" className={inputClass}>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Platform Access */}
          <div className="mt-5">
            <p className="text-xs text-[#9CA3AF] mb-3">Platform Access</p>
            <div className="grid grid-cols-3 gap-3">
              {/* CRM */}
              <button
                type="button"
                onClick={() => togglePlatform('crm')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  platforms.crm
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563] hover:border-white/10'
                }`}
              >
                <Database className="w-5 h-5" />
                <span className="text-xs font-medium">CRM</span>
                {platforms.crm && <Check className="w-3.5 h-3.5" />}
              </button>
              {/* CDI */}
              <button
                type="button"
                onClick={() => togglePlatform('cdi')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  platforms.cdi
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563] hover:border-white/10'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-medium">CDI</span>
                {platforms.cdi && <Check className="w-3.5 h-3.5" />}
              </button>
              {/* CEFR Speaking */}
              <button
                type="button"
                onClick={() => togglePlatform('cefr_speaking')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  platforms.cefr_speaking
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563] hover:border-white/10'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span className="text-xs font-medium">CEFR Speaking</span>
                {platforms.cefr_speaking && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-white/[0.04]"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6B7280' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white' }}>
              {isSubmitting ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Edit Admin Modal
───────────────────────────────────────────── */
type EditModalProps = {
  admin: SuperAdmin;
  token: string;
  onClose: () => void;
  onUpdated: (id: number, data: Partial<SuperAdmin>) => void;
};

const EditAdminModal = ({ admin, token, onClose, onUpdated }: EditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformAccess>({ ...admin.platformAccess });
  const [status, setStatus] = useState(admin.status);

  const togglePlatform = (key: keyof PlatformAccess) => setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl(`/api/dev/superadmins/${admin.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platformAccess: platforms, status }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Update failed.');

      onUpdated(admin.id, { platformAccess: platforms, status });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: '#0E0F14', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="text-base font-semibold text-[#F7F7F8]">Edit Admin Access</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">@{admin.username} · {admin.centerName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05]"><X className="w-4 h-4 text-[#6B7280]" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Account Status</p>
            <div className="flex gap-2">
              {(['Active', 'Inactive', 'Suspended'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    status === s ? 'bg-purple-500/15 border-purple-500/40 text-purple-400' : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563] hover:border-white/10'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Access */}
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Platform Access</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'crm' as const, label: 'CRM', Icon: Database },
                { key: 'cdi' as const, label: 'CDI', Icon: Globe },
                { key: 'cefr_speaking' as const, label: 'CEFR Speaking', Icon: Mic },
              ] as const).map(({ key, label, Icon }) => (
                <button key={key} type="button" onClick={() => togglePlatform(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    platforms[key]
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#4B5563] hover:border-white/10'
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
                  {platforms[key] && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-white/[0.04]"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6B7280' }}>Cancel</button>
            <button onClick={handleSave} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white' }}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────────── */
type DeleteModalProps = { admin: SuperAdmin; token: string; onClose: () => void; onDeleted: (id: number) => void };

const DeleteAdminModal = ({ admin, token, onClose, onDeleted }: DeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/dev/superadmins/${admin.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.message || 'Delete failed.');
      }
      onDeleted(admin.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl border p-6" style={{ background: '#0E0F14', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-center text-[#F7F7F8] mb-2">Delete Admin Account?</h2>
        <p className="text-sm text-center text-[#6B7280] mb-6">
          This will permanently delete <strong className="text-[#9CA3AF]">@{admin.username}</strong>. This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-white/[0.04]"
            style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6B7280' }}>Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: React.ElementType; accent: string }) => (
  <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
    </div>
    <p className="text-2xl font-semibold text-[#F7F7F8] mb-1">{value}</p>
    <p className="text-xs" style={{ color: '#6B7280' }}>{label}</p>
  </div>
);

/* ─────────────────────────────────────────────
   Main DevDashboardPage
───────────────────────────────────────────── */
const DevDashboardPage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [devUser, setDevUser] = useState<DevUser | null>(null);
  const [activeNav, setActiveNav] = useState<NavId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [stats, setStats] = useState<DevStats | null>(null);
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<SuperAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SuperAdmin | null>(null);

  const token = getDevToken() ?? '';

  /* ── Auth check ── */
  useEffect(() => {
    const t = getDevToken();
    const user = getDevUser();

    if (!t) { window.location.replace('/dev-login'); return; }
    if (user) setDevUser(user);

    const ctrl = new AbortController();
    fetch(apiUrl('/api/dev/auth/me'), {
      headers: { Authorization: `Bearer ${t}` },
      signal: ctrl.signal,
    })
      .then((r) => { if (!r.ok) throw new Error('invalid'); })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return; // ignore cancellation from StrictMode double-mount
        clearDevSession();
        window.location.replace('/dev-login');
      })
      .finally(() => { if (!ctrl.signal.aborted) setIsChecking(false); });

    return () => ctrl.abort();
  }, []);

  /* ── Load stats ── */
  useEffect(() => {
    if (isChecking) return;
    setLoadingStats(true);
    fetch(apiUrl('/api/dev/stats'), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setStats(d as DevStats))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [isChecking, token]);

  /* ── Load admins ── */
  const loadAdmins = () => {
    if (!token) return;
    setLoadingAdmins(true);
    fetch(apiUrl('/api/dev/superadmins'), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAdmins(d as SuperAdmin[]))
      .catch(console.error)
      .finally(() => setLoadingAdmins(false));
  };

  useEffect(() => {
    if (isChecking) return;
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking]);

  /* ── Logout ── */
  const handleLogout = () => { clearDevSession(); window.location.assign('/dev-login'); };

  /* ── Handlers ── */
  const handleCreated = (admin: SuperAdmin) => {
    setAdmins((prev) => [admin, ...prev]);
    if (stats) setStats({ ...stats, totalAdmins: stats.totalAdmins + 1, activeAdmins: stats.activeAdmins + 1 });
  };

  const handleUpdated = (id: number, data: Partial<SuperAdmin>) => {
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a));
  };

  const handleDeleted = (id: number) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    if (stats) setStats({ ...stats, totalAdmins: stats.totalAdmins - 1 });
  };

  /* ── Filtered admins ── */
  const filteredAdmins = admins.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.username.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.centerName.toLowerCase().includes(q)
    );
  });

  /* ── Loading ── */
  if (isChecking) {
    return (
      <main className="min-h-screen bg-[#06070A] text-[#F7F7F8] flex items-center justify-center">
        <div className="rounded-xl border px-6 py-4 text-sm text-[#6B7280]"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          Verifying developer session…
        </div>
      </main>
    );
  }

  const NAV = [
    { id: 'overview' as NavId, label: 'Overview', Icon: LayoutDashboard },
    { id: 'admins' as NavId, label: 'Manage Admins', Icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#06070A] text-[#F7F7F8] overflow-hidden">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ════════ SIDEBAR ════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#090A0E', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">EduFlow</p>
              <p className="text-[10px]" style={{ color: '#6B7280' }}>Developer Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.05] lg:hidden">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {NAV.map(({ id, label, Icon }) => {
            const active = activeNav === id;
            return (
              <button key={id} onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  active
                    ? 'text-purple-400'
                    : 'text-[#4B5563] hover:text-[#F7F7F8] hover:bg-white/[0.04]'
                }`}
                style={active ? { background: 'rgba(124,58,237,0.12)' } : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Developer user info */}
        <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white' }}>
              {(devUser?.displayName ?? devUser?.username ?? 'D').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate text-[#F7F7F8]">{devUser?.displayName || devUser?.username}</p>
              <p className="text-[10px]" style={{ color: '#6B7280' }}>Developer</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-[#4B5563] hover:text-red-400 hover:bg-red-500/5">
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ════════ MAIN CONTENT ════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(9,10,14,0.8)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/[0.05] lg:hidden">
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-[#F7F7F8]">
              {activeNav === 'overview' ? 'Overview' : 'Manage Admins'}
            </h1>
            <p className="text-xs" style={{ color: '#4B5563' }}>
              {activeNav === 'overview' ? 'System health and summary stats' : 'Create, edit, and manage superadmin accounts'}
            </p>
          </div>
          {activeNav === 'admins' && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5563]" />
                <input
                  type="text"
                  placeholder="Search admins…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#F7F7F8', width: 200 }}
                />
              </div>
              <button onClick={() => loadAdmins()} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors" title="Refresh">
                <RefreshCw className={`w-4 h-4 text-[#4B5563] ${loadingAdmins ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
                <Plus className="w-3.5 h-3.5" />
                New Admin
              </button>
            </div>
          )}
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ────── OVERVIEW ────── */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              {loadingStats ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Superadmins" value={stats?.totalAdmins ?? 0} icon={Users} accent="#7C3AED" />
                  <StatCard label="Active Admins" value={stats?.activeAdmins ?? 0} icon={Check} accent="#10B981" />
                  <StatCard label="Locked Accounts" value={stats?.lockedAdmins ?? 0} icon={Lock} accent="#EF4444" />
                  <StatCard label="Total Centers" value={stats?.totalCenters ?? 0} icon={Building2} accent="#F59E0B" />
                </div>
              )}

              {/* Recent admins preview */}
              <div className="rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <h3 className="text-sm font-medium text-[#F7F7F8]">Recent Superadmin Accounts</h3>
                  <button onClick={() => setActiveNav('admins')} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {admins.slice(0, 5).map((admin) => (
                    <div key={admin.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.01]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                        {(admin.firstName || admin.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F7F7F8] truncate">
                          {admin.firstName || admin.lastName ? `${admin.firstName} ${admin.lastName}`.trim() : admin.username}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#4B5563' }}>@{admin.username} · {admin.centerName}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <PlatformBadge active={admin.platformAccess.crm} label="CRM" icon={Database} />
                        <PlatformBadge active={admin.platformAccess.cdi} label="CDI" icon={Globe} />
                        <PlatformBadge active={admin.platformAccess.cefr_speaking} label="CEFR" icon={Mic} />
                      </div>
                      <StatusBadge status={admin.status} locked={admin.isLocked} />
                    </div>
                  ))}
                  {admins.length === 0 && !loadingAdmins && (
                    <div className="px-5 py-10 text-center text-sm text-[#4B5563]">
                      No superadmin accounts yet.{' '}
                      <button onClick={() => { setActiveNav('admins'); setShowCreate(true); }} className="text-purple-400 hover:underline">Create one →</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Platforms legend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { Icon: Database, name: 'CRM', key: 'crm', desc: 'Full CRM – students, payments, classes, attendance, reporting', color: '#06B6D4' },
                  { Icon: Globe, name: 'CDI', key: 'cdi', desc: 'Content & Digital Infrastructure – course builder, LMS features', color: '#8B5CF6' },
                  { Icon: Mic, name: 'CEFR Speaking', key: 'cefr_speaking', desc: 'AI-powered spoken English evaluation (A1–C2)', color: '#10B981' },
                ].map(({ Icon, name, desc, color }) => (
                  <div key={name} className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-sm font-medium text-[#F7F7F8]">{name}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#4B5563' }}>{desc}</p>
                    <p className="mt-3 text-xs font-medium" style={{ color }}>
                      {admins.filter((a) => {
                        if (name === 'CRM') return a.platformAccess.crm;
                        if (name === 'CDI') return a.platformAccess.cdi;
                        return a.platformAccess.cefr_speaking;
                      }).length} admin{admins.filter((a) => {
                        if (name === 'CRM') return a.platformAccess.crm;
                        if (name === 'CDI') return a.platformAccess.cdi;
                        return a.platformAccess.cefr_speaking;
                      }).length !== 1 ? 's' : ''} enabled
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────── MANAGE ADMINS ────── */}
          {activeNav === 'admins' && (
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              {/* Mobile search */}
              <div className="sm:hidden px-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4B5563]" />
                  <input
                    type="text"
                    placeholder="Search admins…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#F7F7F8' }}
                  />
                </div>
              </div>

              {loadingAdmins ? (
                <div className="py-20 text-center text-sm text-[#4B5563]">Loading admins…</div>
              ) : filteredAdmins.length === 0 ? (
                <div className="py-20 text-center">
                  <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-[#4B5563]">{search ? 'No admins match your search.' : 'No superadmin accounts yet.'}</p>
                  {!search && (
                    <button onClick={() => setShowCreate(true)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA' }}>
                      <Plus className="w-3.5 h-3.5" />
                      Create first admin
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs" style={{ borderColor: 'rgba(255,255,255,0.05)', color: '#4B5563' }}>
                        <th className="px-5 py-3 font-medium">Admin</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Center</th>
                        <th className="px-4 py-3 font-medium">Platforms</th>
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                        <th className="px-4 py-3 font-medium hidden xl:table-cell">Last Login</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                      {filteredAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                                {(admin.firstName || admin.username).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[#F7F7F8] truncate">
                                  {[admin.firstName, admin.lastName].filter(Boolean).join(' ') || admin.username}
                                </p>
                                <p className="text-xs truncate" style={{ color: '#4B5563' }}>@{admin.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <p className="text-[#9CA3AF] text-xs truncate max-w-[160px]">{admin.centerName || '—'}</p>
                            {admin.city && <p className="text-[#4B5563] text-[11px]">{admin.city}</p>}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1.5 flex-wrap">
                              <PlatformBadge active={admin.platformAccess.crm} label="CRM" icon={Database} />
                              <PlatformBadge active={admin.platformAccess.cdi} label="CDI" icon={Globe} />
                              <PlatformBadge active={admin.platformAccess.cefr_speaking} label="CEFR" icon={Mic} />
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <StatusBadge status={admin.status} locked={admin.isLocked} />
                          </td>
                          <td className="px-4 py-4 hidden xl:table-cell text-xs" style={{ color: '#4B5563' }}>
                            {admin.lastLogin
                              ? new Date(admin.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Never'}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => setEditTarget(admin)}
                                className="p-2 rounded-lg transition-colors hover:bg-white/[0.05] text-[#4B5563] hover:text-[#F7F7F8]"
                                title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteTarget(admin)}
                                className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-[#4B5563] hover:text-red-400"
                                title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ════════ MODALS ════════ */}
      {showCreate && (
        <CreateAdminModal token={token} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {editTarget && (
        <EditAdminModal admin={editTarget} token={token} onClose={() => setEditTarget(null)} onUpdated={handleUpdated} />
      )}
      {deleteTarget && (
        <DeleteAdminModal admin={deleteTarget} token={token} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
};

export default DevDashboardPage;
