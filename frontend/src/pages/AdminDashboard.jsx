import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Check, Clock, X, Trash2 } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Eyebrow } from '../components/UI';
import { StackedLines } from '../components/RevealText';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/api';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/20 text-yellow-300',
  CONFIRMED: 'bg-green-500/20 text-green-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
};

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: Check,
  CANCELLED: X,
};

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Delete this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-svh bg-sand p-2 sm:p-3">
      <div className="relative isolate min-h-[calc(100svh-1rem)] overflow-hidden rounded-[2rem] bg-ocean-deep text-white">
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
            Home
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wide backdrop-blur transition-colors hover:bg-white/20"
            >
              <LogOut className="size-4" />
              Logout
            </button>
            <div className="hidden sm:block">
              <Logo />
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-10 sm:pt-14">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
              <Eyebrow tone="light">Admin Dashboard</Eyebrow>
            </span>
            <StackedLines
              lines={['Reservations']}
              className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
            />
            <p className="mt-2 text-sm text-white/60">
              Welcome back, {user?.fullName || 'Admin'}
            </p>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-coral">{error}</p>
          )}

          {loading ? (
            <p className="mt-8 text-center text-white/50">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="mt-8 text-center text-white/50">No reservations yet.</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }}
              className="mt-8 flex flex-col gap-3"
            >
              {bookings.map((b) => {
                const StatusIcon = STATUS_ICONS[b.status] || Clock;
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{b.customerName}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                            <StatusIcon className="h-3 w-3" />
                            {b.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/60">
                          {b.serviceName} — {b.optionName}
                        </p>
                        <p className="text-xs text-white/40">
                          {b.date}{b.time ? ` at ${b.time}` : ''} · {b.people} {b.people === 1 ? 'person' : 'people'}
                        </p>
                        <p className="text-xs text-white/40">{b.customerEmail}</p>
                        {b.message && (
                          <p className="mt-1 text-xs text-white/50 italic">"{b.message}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 'CONFIRMED')}
                              className="rounded-full bg-green-500/20 p-2 text-green-300 transition-colors hover:bg-green-500/30"
                              title="Confirm"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, 'CANCELLED')}
                              className="rounded-full bg-red-500/20 p-2 text-red-300 transition-colors hover:bg-red-500/30"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="rounded-full bg-white/10 p-2 text-white/50 transition-colors hover:bg-white/20 hover:text-white"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
