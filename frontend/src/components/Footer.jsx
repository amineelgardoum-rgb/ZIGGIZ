import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Logo from './Logo';
import { useI18n } from '../i18n/I18nContext';

const SOCIAL_HREFS = {
  Instagram: 'https://instagram.com/ziggizsurfco',
  X: 'https://x.com/ziggizsurfco',
  YouTube: 'https://youtube.com/@ziggizsurfco',
  TikTok: 'https://tiktok.com/@ziggizsurfco',
};

export default function Footer() {
  const { t } = useI18n();

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer id="contact" className="scroll-mt-24 rounded-[2rem] bg-ocean-deep px-6 py-16 text-white sm:px-10 sm:py-24">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <Link to="/" className="inline-block">
              <Logo />
            </Link>

            <address className="mt-6 not-italic text-sm text-white/70 space-y-1">
              <a href="mailto:crew@ziggiz.com" className="block hover:text-white transition-colors">
                crew@ziggiz.com
              </a>
              <a href="tel:+212600000000" className="block hover:text-white transition-colors">
                +212 6 00 00 00 00
              </a>
              <p className="text-white/50">Casablanca, Morocco</p>
            </address>
          </div>

          <div className="flex items-center justify-between">
            <nav className="flex gap-5 text-sm text-white/60">
              {t.footer.social.map((s) => (
                <a
                  key={s}
                  href={SOCIAL_HREFS[s] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {s}
                </a>
              ))}
            </nav>

            <button
              onClick={toTop}
              aria-label={t.footer.backToTop}
              className="grid size-8 place-items-center rounded-full border border-white/20 text-white/60 transition-colors duration-300 hover:border-sun hover:bg-sun hover:text-ocean-deep"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53317.34896046176!2d-7.648999999999999!3d33.5922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd437d7fcc07%3A0x2da6413b7c8c3c0!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2s!4v1725555555555"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ziggiz Surf Co location"
          />
        </div>
      </div>

      <p className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-white/40">
        {t.footer.copyright}
      </p>
    </footer>
  );
}
