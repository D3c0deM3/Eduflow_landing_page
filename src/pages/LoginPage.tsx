import type { FormEvent } from 'react';
import { ArrowLeft, Lock, User } from 'lucide-react';

const LoginPage = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
                  placeholder="Enter password"
                  className="w-full bg-transparent py-3 outline-none placeholder:text-eduflow-text-secondary/70"
                />
              </div>
            </label>

            <button type="submit" className="btn-primary w-full justify-center mt-2">
              Login
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
