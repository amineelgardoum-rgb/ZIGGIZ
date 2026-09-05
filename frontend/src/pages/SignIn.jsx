import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Eyebrow } from '../components/UI';
import { StackedLines } from '../components/RevealText';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/api';

export default function SignIn() {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const r = t.reservation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.user.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-sand">
      <div className="relative isolate min-h-svh overflow-hidden rounded-[2rem] bg-ocean-deep text-white">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/background/taghazout.jpg"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-ocean-deep/80" />
        </div>

        <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wide backdrop-blur transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            {r.back}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden sm:block">
              <Logo />
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-md px-6 pb-16 pt-10 sm:pt-14">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
              <Eyebrow tone="light">Admin</Eyebrow>
            </span>
            <StackedLines
              lines={['Sign in']}
              className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
            />
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }}
            className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-md sm:p-8"
          >
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ziggiz.com"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]"
              />
            </label>

            {error && (
              <p role="alert" className="text-center text-sm text-coral">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
