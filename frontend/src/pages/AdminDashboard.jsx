import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Check, Clock, X, Trash2, Eye, EyeOff, Star } from 'lucide-react';
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
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load bookings');
      setBookings(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/all`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load reviews');
      setReviews(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    Promise.all([fetchBookings(), fetchReviews()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Delete this booking?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete');
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const approveReview = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to approve');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, displayed: true } : r)));
    } catch (err) {
      setError(err.message);
    }
  };

  const rejectReview = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}/reject`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to reject');
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, displayed: false } : r)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete');
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const pendingReviews = reviews.filter((r) => !r.displayed);
  const approvedReviews = reviews.filter((r) => r.displayed);

  return (
    <div className="min-h-svh bg-sand">
      <div className="relative isolate min-h-svh overflow-hidden rounded-[2rem] bg-ocean-deep text-white">
        <div className="absolute inset-0 -z-10">
          <img src="/images/background/taghazout.jpg" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-ocean-deep/80" />
        </div>

        <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wide backdrop-blur transition-colors hover:bg-white/20">
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wide backdrop-blur transition-colors hover:bg-white/20">
              <LogOut className="size-4" />
              Logout
            </button>
            <div className="hidden sm:block"><Logo /></div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-10 sm:pt-14">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
              <Eyebrow tone="light">Admin Dashboard</Eyebrow>
            </span>
            <StackedLines lines={['Manage']} className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl" />
            <p className="mt-2 text-sm text-white/60">Welcome back, {user?.fullName || 'Admin'}</p>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {['bookings', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-6 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                  tab === t ? 'bg-sun text-ocean-deep' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {t}
                {t === 'reviews' && pendingReviews.length > 0 && (
                  <span className="ml-2 rounded-full bg-coral px-2 py-0.5 text-xs text-white">{pendingReviews.length}</span>
                )}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-center text-sm text-coral">{error}</p>}

          {loading ? (
            <p className="mt-8 text-center text-white/50">Loading...</p>
          ) : tab === 'bookings' ? (
            bookings.length === 0 ? (
              <p className="mt-8 text-center text-white/50">No reservations yet.</p>
            ) : (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }} className="mt-8 flex flex-col gap-3">
                {bookings.map((b) => {
                  const StatusIcon = STATUS_ICONS[b.status] || Clock;
                  return (
                    <div key={b.id} className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{b.customerName}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status]}`}>
                              <StatusIcon className="h-3 w-3" />{b.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-white/60">{b.serviceName} — {b.optionName}</p>
                          <p className="text-xs text-white/40">{b.date}{b.time ? ` at ${b.time}` : ''} · {b.people} {b.people === 1 ? 'person' : 'people'}</p>
                          <p className="text-xs text-white/40">{b.customerEmail}</p>
                          {b.message && <p className="mt-1 text-xs text-white/50 italic">"{b.message}"</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {b.status === 'PENDING' && (
                            <>
                              <button onClick={() => updateBookingStatus(b.id, 'CONFIRMED')} className="rounded-full bg-green-500/20 p-2 text-green-300 transition-colors hover:bg-green-500/30" title="Confirm">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="rounded-full bg-red-500/20 p-2 text-red-300 transition-colors hover:bg-red-500/30" title="Cancel">
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteBooking(b.id)} className="rounded-full bg-white/10 p-2 text-white/50 transition-colors hover:bg-white/20 hover:text-white" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )
          ) : (
            <div className="mt-8 flex flex-col gap-6">
              {pendingReviews.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-yellow-300">Pending approval ({pendingReviews.length})</h3>
                  <div className="flex flex-col gap-3">
                    {pendingReviews.map((r) => (
                      <ReviewCard key={r.id} review={r} onApprove={approveReview} onReject={rejectReview} onDelete={deleteReview} />
                    ))}
                  </div>
                </div>
              )}
              {approvedReviews.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-green-300">Approved ({approvedReviews.length})</h3>
                  <div className="flex flex-col gap-3">
                    {approvedReviews.map((r) => (
                      <ReviewCard key={r.id} review={r} onApprove={approveReview} onReject={rejectReview} onDelete={deleteReview} />
                    ))}
                  </div>
                </div>
              )}
              {reviews.length === 0 && <p className="text-center text-white/50">No reviews yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review: r, onApprove, onReject, onDelete }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{r.authorName}</span>
            {r.displayed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-300">
                <Eye className="h-3 w-3" />Visible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-medium text-yellow-300">
                <EyeOff className="h-3 w-3" />Hidden
              </span>
            )}
          </div>
          {r.authorRole && <p className="mt-1 text-xs text-white/40">{r.authorRole}</p>}
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-sun text-sun' : 'text-white/20'}`} />
            ))}
          </div>
          <p className="mt-2 text-sm text-white/70 italic">"{r.quote}"</p>
        </div>
        <div className="flex items-center gap-2">
          {!r.displayed ? (
            <button onClick={() => onApprove(r.id)} className="rounded-full bg-green-500/20 p-2 text-green-300 transition-colors hover:bg-green-500/30" title="Approve">
              <Eye className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => onReject(r.id)} className="rounded-full bg-yellow-500/20 p-2 text-yellow-300 transition-colors hover:bg-yellow-500/30" title="Hide">
              <EyeOff className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => onDelete(r.id)} className="rounded-full bg-white/10 p-2 text-white/50 transition-colors hover:bg-white/20 hover:text-white" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
