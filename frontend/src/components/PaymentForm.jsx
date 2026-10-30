import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CreditCard, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const YOUCANPAY_SDK_URL = 'https://youcanpay.com/yp.js';
const SDK_TIMEOUT_MS = 8000;
const SDK_POLL_MS = 150;

function localeFor(lang) {
  if (lang === 'ar') return 'ar';
  if (lang === 'fr') return 'fr';
  return 'en';
}

function safeDestroy(payment) {
  try {
    payment?.destroy?.();
  } catch {
    /* already destroyed */
  }
}

function formatAmount(amountMad, currency) {
  const value = Number(amountMad);
  const formatted = Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
    : String(amountMad ?? '');
  return `${formatted} ${currency || 'MAD'}`.trim();
}

export default function PaymentForm({
  tokenId,
  publicKey,
  sandbox,
  amountMad,
  currency,
  email: _email,
  bookingId: _bookingId,
  onPaid,
  onCancel,
}) {
  const { t, lang } = useI18n();
  const r = t.reservation || {};

  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const mountedRef = useRef(true);

  const [sdkAttempt, setSdkAttempt] = useState(0);
  const [sdkStatus, setSdkStatus] = useState(() =>
    typeof window !== 'undefined' && typeof window.yp === 'function' ? 'ready' : 'loading'
  );
  const [mountStatus, setMountStatus] = useState('idle'); // idle | mounting | ready | error
  const [mountError, setMountError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [payError, setPayError] = useState(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 1. Wait for the global `yp` function. The script has no load event we can
  // rely on, so poll for a bounded amount of time and offer a retry.
  useEffect(() => {
    let cancelled = false;

    if (typeof window.yp === 'function') {
      setSdkStatus('ready');
      return undefined;
    }

    setSdkStatus('loading');

    const existing = Array.from(document.scripts).find((s) => (s.src || '').includes('yp.js'));
    if (!existing && !document.querySelector('script[data-youcanpay]')) {
      const script = document.createElement('script');
      script.src = YOUCANPAY_SDK_URL;
      script.async = true;
      script.dataset.youcanpay = 'true';
      document.head.appendChild(script);
    }

    const startedAt = Date.now();
    const poll = window.setInterval(() => {
      if (cancelled) return;
      if (typeof window.yp === 'function') {
        window.clearInterval(poll);
        setSdkStatus('ready');
        return;
      }
      if (Date.now() - startedAt >= SDK_TIMEOUT_MS) {
        window.clearInterval(poll);
        setSdkStatus('error');
      }
    }, SDK_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [sdkAttempt]);

  // 2. Create and mount the card form. React StrictMode double-invokes this
  // effect, so every subscription and the instance itself are cleaned up.
  useEffect(() => {
    if (sdkStatus !== 'ready' || !containerRef.current || !tokenId || !publicKey) {
      return undefined;
    }

    let cancelled = false;
    setMountStatus('mounting');
    setMountError(null);

    let payment;
    try {
      const options = { locale: localeFor(lang) };
      // The key prefix is the source of truth for sandbox mode; this is only a
      // harmless override that matches the bundle's own behaviour.
      if (sandbox) options.sandbox = true;

      payment = window
        .yp(publicKey, options)
        .elements({
          token: tokenId,
          container: containerRef.current,
          gateways: ['credit-card'],
        });
    } catch (err) {
      setMountStatus('error');
      setMountError(err?.message || null);
      return undefined;
    }

    const unsubscribers = [];
    try {
      unsubscribers.push(
        payment.on('ready', () => {
          if (!cancelled && instanceRef.current === payment) setMountStatus('ready');
        })
      );
      unsubscribers.push(
        payment.on('error', (err) => {
          if (cancelled) return;
          if (instanceRef.current === payment) instanceRef.current = null;
          safeDestroy(payment);
          setMountStatus('error');
          setMountError(err?.message || null);
        })
      );
    } catch {
      /* older SDK builds may not expose `on` */
    }

    payment
      .mount()
      .then(() => {
        if (cancelled) {
          safeDestroy(payment);
          return;
        }
        instanceRef.current = payment;
        setMountStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        instanceRef.current = null;
        setMountStatus('error');
        setMountError(err?.code || err?.message || null);
      });

    return () => {
      cancelled = true;
      unsubscribers.forEach((off) => {
        try {
          off?.();
        } catch {
          /* noop */
        }
      });
      if (instanceRef.current === payment) instanceRef.current = null;
      safeDestroy(payment);
    };
  }, [sdkStatus, tokenId, publicKey, sandbox, lang]);

  // A new token means a fresh attempt: reset any previous success/failure UI.
  useEffect(() => {
    setSucceeded(false);
    setPayError(null);
    setPaying(false);
  }, [tokenId]);

  const handleRetrySdk = () => {
    setSdkStatus('loading');
    setMountError(null);
    setMountStatus('idle');
    setSdkAttempt((n) => n + 1);
  };

  const handlePay = async () => {
    const payment = instanceRef.current;
    if (!payment || paying || succeeded) return;

    setPaying(true);
    setPayError(null);

    let result;
    try {
      result = await payment.confirm();
    } catch (err) {
      if (mountedRef.current) {
        setPaying(false);
        setPayError(err?.message || r.paymentFailed || 'Payment failed. Please try again.');
      }
      return;
    }

    if (result?.status === 'succeeded') {
      setSucceeded(true);
      setPaying(false);
      try {
        await onPaid?.(result);
      } catch {
        /* parent handles its own polling errors */
      }
      return;
    }

    if (!mountedRef.current) return;
    setPaying(false);
    setPayError(
      result?.error?.message || r.paymentFailed || 'Payment failed. Please try again.'
    );
  };

  const mountErrorMessage =
    mountError === 'invalid_container' || mountError === 'host_not_allowed'
      ? r.paymentMountUnavailable || 'Secure payment is unavailable right now. You can pay on arrival instead.'
      : r.paymentMountUnavailable || 'Secure payment is unavailable right now. You can pay on arrival instead.';

  const showForm = sdkStatus === 'ready' && mountStatus !== 'error';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            {r.paymentAmountDue || 'Amount due'}
          </span>
          <p dir="ltr" className="mt-1 font-display text-3xl font-medium tracking-tight text-white">
            {formatAmount(amountMad, currency)}
          </p>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-sun">
          <CreditCard className="size-5" />
        </div>
      </div>

      <p className="text-sm leading-relaxed text-white/70">
        {r.paymentInstruction || 'Please enter your card details to complete the booking.'}
      </p>

      {succeeded ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
          <Loader2 className="size-6 animate-spin text-sun" />
          <p className="font-display text-xl font-medium">
            {r.paymentConfirming || 'Confirming your payment…'}
          </p>
          <p className="text-sm text-white/70">
            {r.paymentConfirmingHint ||
              'Payment received. We are confirming your booking — this can take a few seconds.'}
          </p>
        </div>
      ) : (
        <>
          {sdkStatus === 'error' ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-2xl border border-coral/40 bg-coral/10 p-5 text-center"
            >
              <AlertCircle className="size-5 text-coral" />
              <p className="text-sm text-white/80">
                {r.paymentLoadError || 'Could not load the secure payment form.'}
              </p>
              <button
                type="button"
                onClick={handleRetrySdk}
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                {r.paymentRetry || 'Try again'}
              </button>
            </div>
          ) : mountStatus === 'error' ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-2xl border border-coral/40 bg-coral/10 p-5 text-center"
            >
              <AlertCircle className="size-5 text-coral" />
              <p className="text-sm text-white/80">{mountErrorMessage}</p>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-wide text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                {r.payOnArrivalInstead || 'Pay on arrival instead'}
              </button>
            </div>
          ) : (
            <>
              <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-white p-3">
                {showForm && (
                  <div ref={containerRef} className="min-h-[200px]" />
                )}
                {!showForm && (
                  <div className="absolute inset-0 grid place-items-center">
                    <Loader2 className="size-6 animate-spin text-ocean-deep/60" />
                  </div>
                )}
              </div>

              {payError && (
                <p role="alert" className="text-center text-sm text-coral">
                  {payError}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={paying || mountStatus !== 'ready'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ocean-deep transition-colors hover:bg-coral disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {r.paymentProcessing || 'Processing…'}
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    {r.paymentPayButton || 'Pay'} {formatAmount(amountMad, currency)}
                  </>
                )}
              </button>

              <p className="flex items-start gap-2 text-xs leading-relaxed text-white/60">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sun" />
                <span>
                  {r.paymentSecureNote ||
                    'Your card is handled securely by YouCan Pay. Your booking is confirmed once payment clears.'}
                </span>
              </p>
            </>
          )}
        </>
      )}

      {!succeeded && (
        <button
          type="button"
          onClick={onCancel}
          disabled={paying}
          className="w-full rounded-full border border-white/20 bg-white/10 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          {r.payOnArrivalInstead || 'Pay on arrival instead'}
        </button>
      )}
    </div>
  );
}
