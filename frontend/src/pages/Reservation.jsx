import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Banknote, Check, CreditCard, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Eyebrow } from '../components/UI';
import { StackedLines } from '../components/RevealText';
import { useI18n } from '../i18n/I18nContext';
import { getLenis } from '../hooks/useLenis';
import { submitReservation, fetchServices, initiatePayment, getPaymentStatus } from '../lib/api';
import { validateReservation, MAX_PEOPLE } from '../lib/validate';
import PaymentForm from '../components/PaymentForm';

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00'];
const PAYMENT_POLL_INTERVAL_MS = 2000;
const PAYMENT_POLL_TIMEOUT_MS = 60000;

// The reservation form books the pricing-sheet catalogue only. These are the
// canonical backend service/option names, mirrored here so the form is usable
// before `/api/services` responds (or if it fails).
const PRICING_SERVICE_NAMES = ['Excursions', 'Surf Retreats'];

const FALLBACK_ENTRIES = [
  { service: 'Excursions', option: 'Agadir Tour', note: 'Kasbah viewpoint, harbour, souk, marina, argan oil', priceMad: 300, times: ['10:00', '15:00'], requiresTime: true },
  { service: 'Excursions', option: 'Paradise Valley', note: 'Half-day, local villages, oasis, walking', priceMad: 500, times: ['09:10'], requiresTime: true },
  { service: 'Excursions', option: 'Crocoparc', note: 'Crocodiles, anacondas, botanical gardens', priceMad: 400, times: ['10:00', '14:00'], requiresTime: true },
  { service: 'Excursions', option: 'Mini Sahara 4×4', note: '4×4 safari, lunch, sand dunes, wild beach', priceMad: 600, times: ['08:00'], requiresTime: true },
  { service: 'Excursions', option: 'Boat Trip', note: 'Fishing, lunch, drinks, music', priceMad: 600, times: ['09:00'], requiresTime: true },
  { service: 'Excursions', option: 'Sunset Barbecue', note: 'Camel ride at sunset, dinner in the tent', priceMad: 600, times: ['16:30'], requiresTime: true },
  { service: 'Excursions', option: 'Marrakech Day Trip', note: 'Jamaa Lfena, market, mosque, gardens, free time', priceMad: 600, times: ['07:00'], requiresTime: true },
  { service: 'Excursions', option: 'Hot Air Ballooning', note: 'Sunrise panorama, breakfast in a Berber tent', priceMad: 2500, times: ['04:15'], requiresTime: true },
  { service: 'Excursions', option: 'Essaouira', note: 'Old medina, artisans, harbour, Scala (Mon/Wed/Fri)', priceMad: 500, times: ['08:15'], requiresTime: true },
  { service: 'Excursions', option: 'Camel Riding', note: 'Two hours with souvenir photos', priceMad: 400, times: ['10:00', '12:00', '14:00', '16:00'], requiresTime: true },
  { service: 'Excursions', option: 'Buggy & Quad', note: 'Half-day buggy (2 people) or quad, drinks and photos', priceMad: 450, times: ['09:00', '14:00'], requiresTime: true },
  { service: 'Excursions', option: 'Goats on the Argan Tree', note: 'Argan villages, photo stop', priceMad: 450, times: ['08:30'], requiresTime: true },
  { service: 'Excursions', option: 'Taroudant-Tiout', note: 'Old city, souk medina, lunch, Ali Baba kasbah, oasis', priceMad: 600, times: ['08:00'], requiresTime: true },
  { service: 'Surf Retreats', option: '3-Day Blissful Retreat', note: 'Daily lessons, meals, stay & surf transfers — per person; Bonus 1-day trip', priceMad: null, times: null, requiresTime: false },
  { service: 'Surf Retreats', option: '7-Day Blissful Retreat', note: 'Daily lessons, meals, stay & surf transfers — per person; Bonus 1-day trip', priceMad: null, times: null, requiresTime: false },
  { service: 'Surf Retreats', option: '10-Day Blissful Retreat', note: 'Daily lessons, meals, stay & surf transfers — per person; Bonus 2-day trip', priceMad: null, times: null, requiresTime: false },
];

function flattenPricingServices(data) {
  if (!Array.isArray(data)) return null;
  const entries = [];

  for (const serviceName of PRICING_SERVICE_NAMES) {
    const parent = data.find((svc) => svc?.name === serviceName);
    if (!parent) continue;

    const requiresTime = Boolean(parent.requiresTime);
    for (const option of parent.options || []) {
      entries.push({
        service: parent.name,
        option: option.name,
        note: option.note,
        priceMad: option.priceMad ?? null,
        times: Array.isArray(option.times) && option.times.length > 0 ? option.times : null,
        requiresTime,
      });
    }
  }

  return entries.length > 0 ? entries : null;
}

function clampIndex(value, max) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : 0;
}

function todayISO() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

function formatMad(value) {
  const amount = Number(value);
  const formatted = Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)
    : String(value ?? '');
  return `${formatted} MAD`;
}

export default function Reservation() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [services, setServices] = useState(FALLBACK_ENTRIES);

  const [selection, setSelection] = useState(() =>
    clampIndex(params.get('service'), FALLBACK_ENTRIES.length - 1)
  );
  const [status, setStatus] = useState(() => (params.get('payment') === 'success' ? 'done' : 'idle'));
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [people, setPeople] = useState('1');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentData, setPaymentData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [paymentFailure, setPaymentFailure] = useState(null);

  const mountedRef = useRef(true);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        const flattened = flattenPricingServices(data);
        if (flattened) {
          setServices(flattened);
          setSelection((prev) => Math.min(prev, flattened.length - 1));
        }
      })
      .catch(() => {});
  }, []);

  const pickService = (i) => {
    setSelection(i);
    setSelectedTime('');
  };

  const selectedEntry = services[selection];
  const isActivity = Boolean(selectedEntry?.requiresTime);
  const unitPrice = selectedEntry?.priceMad;
  const hasPrice = unitPrice !== null && unitPrice !== undefined && Number.isFinite(Number(unitPrice));
  const peopleCount = Number.parseInt(people, 10);
  const safePeople = Number.isFinite(peopleCount) && peopleCount > 0 ? peopleCount : 1;
  const totalPrice = hasPrice ? Number(unitPrice) * safePeople : null;
  const optionTimes = selectedEntry?.times;
  const timeSlots = Array.isArray(optionTimes) && optionTimes.length > 0
    ? [...optionTimes].map(String).sort()
    : TIME_SLOTS;
  // Price-on-request options cannot be paid online: fall back to pay on arrival.
  const effectivePaymentMethod = hasPrice ? paymentMethod : 'arrival';

  const clearFieldError = (fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());

    if (isActivity && !raw.time) {
      setFieldErrors({ time: 'required' });
      setSubmitError(null);
      return;
    }

    const errors = validateReservation(raw);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError(null);
      return;
    }

    const payload = {
      service: selectedEntry?.service,
      option: selectedEntry?.option,
      date: raw.date,
      time: isActivity ? raw.time : null,
      people: raw.people,
      name: raw.name,
      email: raw.email,
      message: raw.message || '',
    };

    setFirstName((raw.name || '').toString().split(' ')[0]);
    setStatus('sending');
    setSubmitError(null);
    setServerMessage(null);
    setPaymentFailure(null);
    setOutcome(null);
    try {
      const created = await submitReservation(payload);
      setBooking({ id: created.id, email: payload.email });

      if (effectivePaymentMethod === 'arrival') {
        setOutcome('arrival');
        setStatus('done');
        return;
      }

      try {
        // Try to initiate payment. If it fails (e.g. priced on request),
        // we still show the success message for the booking.
        const payment = await initiatePayment(created.id, payload.email);
        setPaymentData(payment);
        setStatus('payment');
      } catch (payErr) {
        console.warn('Payment initiation failed, proceeding to success:', payErr);
        setOutcome('contact');
        setStatus('done');
      }
    } catch (err) {
      setStatus('idle');
      setSubmitError(err?.code || 'http');
      setServerMessage(err?.message || null);
    }
  };

  // Never trust the browser result: YouCan Pay's signed webhook is what moves
  // the payment to PAID and the booking to CONFIRMED, so poll the backend.
  const handlePaid = async () => {
    if (!booking?.id || !booking?.email) {
      setOutcome('pending-confirmation');
      setStatus('done');
      return;
    }

    setStatus('confirming');
    const startedAt = Date.now();

    while (mountedRef.current && Date.now() - startedAt < PAYMENT_POLL_TIMEOUT_MS) {
      try {
        const payment = await getPaymentStatus(booking.id, booking.email);
        if (!mountedRef.current) return;

        if (payment?.status === 'PAID') {
          setOutcome('paid');
          setStatus('done');
          return;
        }
        if (payment?.status === 'FAILED' || payment?.status === 'REFUNDED') {
          setPaymentFailure(payment?.failureReason || null);
          setOutcome('failed');
          setStatus('failed');
          return;
        }
      } catch {
        // Transient network/server errors: keep polling until the timeout.
      }

      await new Promise((resolve) => {
        pollTimerRef.current = window.setTimeout(resolve, PAYMENT_POLL_INTERVAL_MS);
      });
    }

    if (mountedRef.current) {
      setOutcome('pending-confirmation');
      setStatus('done');
    }
  };

  const handleRetryPayment = async () => {
    if (!booking?.id || !booking?.email) return;
    setStatus('retrying');
    setPaymentData(null);
    setPaymentFailure(null);
    setOutcome(null);
    try {
      const payment = await initiatePayment(booking.id, booking.email);
      setPaymentData(payment);
      setStatus('payment');
    } catch (payErr) {
      console.warn('Payment re-initiation failed:', payErr);
      setOutcome('contact');
      setStatus('done');
    }
  };

  const handlePayOnArrival = () => {
    setPaymentFailure(null);
    setOutcome('arrival');
    setStatus('done');
  };

  const r = t.reservation;
  const isPaymentSuccess = params.get('payment') === 'success';
  const isSummary = !['idle', 'sending', 'retrying'].includes(status);
  const doneTitle = isPaymentSuccess
    ? r.paymentSuccessTitle || 'Payment Successful!'
    : outcome === 'paid'
      ? r.paymentPaidTitle || 'Payment confirmed'
      : outcome === 'failed'
        ? r.paymentFailedTitle || 'Payment failed'
        : r.doneTitle;

  const doneBody = isPaymentSuccess
    ? r.paymentSuccessBody || 'Your booking has been confirmed. We look forward to seeing you!'
    : outcome === 'paid'
      ? r.paymentPaidBody || 'Your booking is confirmed — we look forward to seeing you!'
      : outcome === 'arrival'
        ? r.arrivalNote || 'Your spot is reserved. Please pay in cash when you arrive.'
        : outcome === 'contact'
          ? r.contactNote || 'Our team will contact you shortly to arrange payment.'
          : outcome === 'pending-confirmation'
            ? r.paymentPendingConfirmation || 'Payment received — we are confirming your booking shortly.'
            : `${firstName ? `${r.doneThanks.replace('{name}', firstName)} ` : ''}${r.doneBody}`;

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

        <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 backdrop-blur-md">
              <Eyebrow tone="light">{r.eyebrow}</Eyebrow>
            </span>
            <StackedLines
              lines={isSummary ? [doneTitle] : r.titleLines}
              className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
            />
          </div>

          {status === 'idle' || status === 'sending' ? (
            <motion.form
              onSubmit={handleSubmit}
              onChange={(e) => clearFieldError(e.target.name)}
              noValidate
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }}
              className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-md sm:p-8"
            >
              <div className="grid gap-4">
                <Select
                  label={r.serviceLabel}
                  name="service"
                  value={selection}
                  onChange={(e) => pickService(Number(e.target.value))}
                  options={services.map((entry, i) => ({ value: i, label: entry.option }))}
                />
                {selectedEntry?.note && (
                  <p className="-mt-2 text-xs leading-relaxed text-white/55">{selectedEntry.note}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={r.dateLabel}
                  name="date"
                  type="date"
                  min={todayISO()}
                  required
                  error={fieldErrors.date && r.errors[fieldErrors.date]}
                />
                <Field
                  label={r.peopleLabel}
                  name="people"
                  type="number"
                  min="1"
                  max={String(MAX_PEOPLE)}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  required
                  error={fieldErrors.people && r.errors[fieldErrors.people]}
                />
              </div>

              {isActivity && (
                <Select
                  label={r.timeLabel}
                  name="time"
                  value={selectedTime}
                  onChange={(e) => { setSelectedTime(e.target.value); clearFieldError('time'); }}
                  options={[{ value: '', label: r.timePlaceholder || 'Select a time' }, ...timeSlots.map((slot) => ({ value: slot, label: slot }))]}
                  error={fieldErrors.time && r.errors[fieldErrors.time]}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={r.nameLabel}
                  name="name"
                  placeholder={r.namePlaceholder}
                  required
                  error={fieldErrors.name && r.errors[fieldErrors.name]}
                />
                <Field
                  label={r.emailLabel}
                  name="email"
                  type="email"
                  placeholder={r.emailPlaceholder}
                  required
                  error={fieldErrors.email && r.errors[fieldErrors.email]}
                />
              </div>

              <Field
                label={r.messageLabel}
                name="message"
                as="textarea"
                rows={3}
                placeholder={r.messagePlaceholder}
              />

              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                  {r.priceSummaryLabel || 'Price summary'}
                </span>
                {hasPrice ? (
                  <dl className="mt-3 flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-white/70">{r.pricePerPerson || 'Price per person'}</dt>
                      <dd dir="ltr" className="font-display text-lg font-medium">
                        {formatMad(unitPrice)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-2">
                      <dt className="text-sm text-white/70">
                        {safePeople === 1
                          ? r.totalForOne || 'Total for 1 person'
                          : (r.totalForPeople || 'Total for {count} people').replace('{count}', String(safePeople))}
                      </dt>
                      <dd dir="ltr" className="font-display text-xl font-semibold text-sun">
                        {formatMad(totalPrice)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {r.priceOnRequest || 'Price on request — we\'ll contact you to arrange payment'}
                  </p>
                )}
              </div>

              <PaymentMethodChoice
                value={effectivePaymentMethod}
                onChange={setPaymentMethod}
                cardDisabled={!hasPrice}
                labels={{
                  legend: r.paymentMethodLabel || 'Payment method',
                  card: r.methodCard || 'Pay online by card',
                  cardHint: r.methodCardHint || 'Secure card payment via YouCan Pay',
                  cardDisabledNote:
                    r.onlineUnavailableNote ||
                    'Online card payment isn\'t available for this option — pay on arrival',
                  arrival: r.methodArrival || 'Pay on arrival (cash)',
                  arrivalHint: r.methodArrivalHint || 'Reserve now, pay in cash when you arrive',
                }}
              />

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral disabled:opacity-60"
              >
                {status === 'sending' ? r.submitting : r.submit}
              </button>

              {submitError && (
                <div role="alert" className="flex flex-col items-center gap-3">
                  <p className="text-center text-sm text-coral">
                    {serverMessage || r.errors[submitError] || r.errors.http}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSubmitError(null); setServerMessage(null); }}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    {r.retry || 'Try again'}
                  </button>
                </div>
              )}
            </motion.form>
          ) : status === 'payment' || status === 'confirming' || status === 'retrying' ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="rounded-3xl border border-white/15 bg-black/30 p-8 backdrop-blur-md"
            >
              {paymentData ? (
                <PaymentForm
                  tokenId={paymentData.tokenId}
                  publicKey={paymentData.publicKey}
                  sandbox={paymentData.sandbox}
                  amountMad={paymentData.amountMad}
                  currency={paymentData.currency}
                  email={booking?.email}
                  bookingId={booking?.id}
                  onPaid={handlePaid}
                  onCancel={handlePayOnArrival}
                />
              ) : (
                <div className="flex items-center justify-center gap-3 py-8 text-sm text-white/70">
                  <Loader2 className="size-5 animate-spin text-sun" />
                  {status === 'retrying'
                    ? r.paymentPreparing || 'Preparing secure payment…'
                    : r.paymentConfirming || 'Confirming your payment…'}
                </div>
              )}
            </motion.div>
          ) : status === 'failed' ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="rounded-3xl border border-white/15 bg-black/30 p-8 text-center backdrop-blur-md"
            >
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-coral/20 text-coral">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-2xl font-medium">{doneTitle}</p>
              <p className="mt-2 text-sm text-white/70">
                {paymentFailure ||
                  r.paymentFailedBody ||
                  'Your card was not charged. You can try again or choose to pay on arrival.'}
              </p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetryPayment}
                  className="inline-flex items-center gap-2 rounded-full bg-sun px-7 py-3 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral"
                >
                  <CreditCard className="size-4" />
                  {r.paymentRetryButton || 'Try payment again'}
                </button>
                <button
                  type="button"
                  onClick={handlePayOnArrival}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Banknote className="size-4" />
                  {r.payOnArrivalInstead || 'Pay on arrival instead'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="rounded-3xl border border-white/15 bg-black/30 p-8 text-center backdrop-blur-md"
            >
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-sun text-ocean-deep">
                <Check className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-2xl font-medium">{doneTitle}</p>
              <p className="mt-2 text-sm text-white/70">{doneBody}</p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-full bg-sun px-7 py-3 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral"
              >
                {r.doneButton}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClasses =
  'mt-2 w-full rounded-xl border border-white/15 bg-sand-deep px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-ocean-light [color-scheme:dark]';

function PaymentMethodChoice({ value, onChange, labels, cardDisabled = false }) {
  const options = [
    {
      id: 'card',
      icon: CreditCard,
      label: labels.card,
      hint: cardDisabled ? labels.cardDisabledNote : labels.cardHint,
      disabled: cardDisabled,
    },
    { id: 'arrival', icon: Banknote, label: labels.arrival, hint: labels.arrivalHint },
  ];

  return (
    <fieldset>
      <legend className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
        {labels.legend}
      </legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {options.map(({ id, icon: Icon, label, hint, disabled }) => {
          const active = value === id;
          return (
            <label
              key={id}
              className={`flex items-start gap-3 rounded-xl border p-4 text-start transition-colors focus-within:ring-2 focus-within:ring-sun/60 ${
                disabled
                  ? 'cursor-not-allowed border-white/10 bg-sand-deep/50 opacity-50'
                  : active
                    ? 'cursor-pointer border-sun bg-white/10'
                    : 'cursor-pointer border-white/15 bg-sand-deep hover:border-white/30'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={id}
                checked={active}
                disabled={disabled}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                  active ? 'bg-sun text-ocean-deep' : 'bg-white/10 text-white/70'
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-white/80'}`}>
                  {label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/55">{hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({ label, name, type = 'text', placeholder, as = 'input', rows, min, max, value, defaultValue, onChange, required, error }) {
  const Comp = as;
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{label}</span>
      <Comp
        name={name}
        type={as === 'input' ? type : undefined}
        rows={rows}
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`${inputClasses} ${error ? 'border-coral' : ''}`}
      />
      {error && (
        <span role="alert" className="mt-1.5 block text-xs text-coral">
          {error}
        </span>
      )}
    </label>
  );
}

function Select({ label, name, value, onChange, options, error }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">{label}</span>
      <select name={name} value={value} onChange={onChange} className={`${inputClasses} ${error ? 'border-coral' : ''}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="mt-1.5 block text-xs text-coral">
          {error}
        </span>
      )}
    </label>
  );
}
