import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { getAuthToken, setAuthSession } from '../lib/auth';

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      window.location.replace('/dashboard');
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const login = String(formData.get('login') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; token?: string; user?: { id: number; login: string; role: string; displayName?: string; centerId?: number; platformAccess?: { crm: boolean; cdi: boolean; cefr_speaking: boolean } } }
        | null;

      if (!response.ok || !data?.token || !data.user) {
        throw new Error(data?.message || 'Invalid login or password.');
      }

      setAuthSession(data.token, data.user);
      window.location.assign('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-eduflow-dark text-eduflow-text-primary relative overflow-hidden flex items-center justify-center px-4">
      <div className="glow-orb glow-orb-cyan w-[30vw] h-[30vw] left-[10%] top-[20%]" />
      <div className="glow-orb glow-orb-purple w-[26vw] h-[26vw] right-[10%] bottom-[20%]" />

      <div className="w-full max-w-md relative z-10">
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="inline-flex items-center gap-2 text-eduflow-text-secondary hover:text-eduflow-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="glass-card p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Login</h1>
          <p className="text-eduflow-text-secondary mb-6">
            Enter your login and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-eduflow-text-secondary">Login</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3">
                <User className="w-4 h-4 text-eduflow-text-secondary" />
                <input
                  type="text"
                  name="login"
                  required
                  autoComplete="username"
                  placeholder="Enter login"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-eduflow-text-secondary/70"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-eduflow-text-secondary">Password</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3">
                <Lock className="w-4 h-4 text-eduflow-text-secondary" />
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-eduflow-text-secondary/70"
                />
              </div>
            </label>

            {error ? (
              <p className="text-sm text-red-300 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
