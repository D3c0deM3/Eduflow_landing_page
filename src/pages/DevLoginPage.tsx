import { useEffect, useState, type FormEvent } from 'react';
import { Terminal, Lock, User } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { getDevToken, setDevSession, type DevUser } from '../lib/auth';

const DevLoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getDevToken()) {
      window.location.replace('/dev-dashboard');
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get('username') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/dev/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; token?: string; devUser?: DevUser }
        | null;

      if (!response.ok || !data?.token || !data.devUser) {
        throw new Error(data?.message || 'Invalid username or password.');
      }

      setDevSession(data.token, data.devUser);
      window.location.assign('/dev-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06070A] text-[#F7F7F8] relative overflow-hidden flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute w-[35vw] h-[35vw] rounded-full left-[5%] top-[10%] opacity-10"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
      <div className="absolute w-[30vw] h-[30vw] rounded-full right-[5%] bottom-[10%] opacity-10"
        style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(90deg, #7C3AED 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Developer badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border"
            style={{ background: 'rgba(124,58,237,0.12)', borderColor: 'rgba(124,58,237,0.3)', color: '#A78BFA' }}>
            <Terminal className="w-3.5 h-3.5" />
            Developer Portal
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Terminal className="w-7 h-7 text-purple-400" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-1">Developer Access</h1>
          <p className="text-sm text-center mb-7" style={{ color: '#6B7280' }}>
            Sign in to the EduFlow developer dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm mb-2 block" style={{ color: '#9CA3AF' }}>Username</span>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-purple-500/60"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <User className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-600"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm mb-2 block" style={{ color: '#9CA3AF' }}>Password</span>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-purple-500/60"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-600"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#374151' }}>
          © 2025 EduFlow · Internal developer access only
        </p>
      </div>
    </main>
  );
};

export default DevLoginPage;
