import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Eyebrow } from '../components/UI';
import { StackedLines } from '../components/RevealText';
import { useI18n } from '../i18n/I18nContext';
import { getLenis } from '../hooks/useLenis';
import { submitReservation, fetchServices } from '../lib/api';
import { validateReservation, MAX_PEOPLE } from '../lib/validate';

const ACTIVITY_SERVICES = ['Surf Lessons', 'Quad Trips', 'Boat Trips'];
const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00'];

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

export default function Reservation() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const fallbackServices = t.lessons.panels;
  const [services, setServices] = useState(fallbackServices);

  const [service, setService] = useState(() => clampIndex(params.get('service'), services.length - 1));
  const [option, setOption] = useState(() => {
    const s = clampIndex(params.get('service'), services.length - 1);
    return clampIndex(params.get('option'), (services[s]?.links?.length || 1) - 1);
  });
  const [status, setStatus] = useState('idle');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [serverMessage, setServerMessage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        if (data && data.length > 0) {
          setServices(data.map((svc) => ({
            label: svc.name,
            links: (svc.options || []).map((o) => ({ name: o.name, note: o.note })),
          })));
        }
      })
      .catch(() => {});
  }, []);

  const pickService = (i) => {
    setService(i);
    setOption(0);
    setSelectedTime('');
  };

  const currentServiceName = services[service]?.label || '';
  const isActivity = ACTIVITY_SERVICES.includes(currentServiceName);

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

    const serviceIndex = Number(raw.service);
    const optionIndex = Number(raw.option);

    const payload = {
      service: services[serviceIndex]?.label || raw.service,
      option: services[serviceIndex]?.links?.[optionIndex]?.name || raw.option,
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
    try {
      await submitReservation(payload);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setSubmitError(err?.code || 'http');
      setServerMessage(err?.message || null);
    }
  };

  const r = t.reservation;

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
              lines={r.titleLines}
              className="mt-4 font-display text-4xl font-medium leading-[0.95] tracking-tight sm:text-5xl"
            />
          </div>

          {status !== 'done' ? (
            <motion.form
              onSubmit={handleSubmit}
              onChange={(e) => clearFieldError(e.target.name)}
              noValidate
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26, delay: 0.15 }}
              className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-md sm:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label={r.serviceLabel}
                  name="service"
                  value={service}
                  onChange={(e) => pickService(Number(e.target.value))}
                  options={services.map((s, i) => ({ value: i, label: s.label }))}
                />
                <Select
                  label={r.optionLabel}
                  name="option"
                  value={option}
                  onChange={(e) => setOption(Number(e.target.value))}
                  options={(services[service]?.links || []).map((l, i) => ({ value: i, label: l.name }))}
                />
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
                  defaultValue="1"
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
                  options={[{ value: '', label: r.timePlaceholder || 'Select a time' }, ...TIME_SLOTS.map((t) => ({ value: t, label: t }))]}
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
              <p className="mt-4 font-display text-2xl font-medium">{r.doneTitle}</p>
              <p className="mt-2 text-sm text-white/70">
                {firstName ? `${r.doneThanks.replace('{name}', firstName)} ` : ''}
                {r.doneBody}
              </p>
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

function Field({ label, name, type = 'text', placeholder, as = 'input', rows, min, max, defaultValue, required, error }) {
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
        defaultValue={defaultValue}
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
