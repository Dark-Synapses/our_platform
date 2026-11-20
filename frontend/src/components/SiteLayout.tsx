import { BrandMark } from './BrandMark';
import { siTiktok, siWhatsapp, siYoutube } from 'simple-icons';
import { NotificationBell } from './NotificationBell';

import { useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import type { User } from '../lib/auth';
import { useAuth } from './auth/AuthProvider';
import { brand } from '../content/brand';
import { isPublicPath, reducedMotion, usePublicMotion } from './usePublicMotion';
import { FooterNetwork } from './FooterNetwork';

type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'facebook'
  | 'youtube'
  | 'whatsapp';

const socialLinks: {
  label: string;
  href: string;
  icon: SocialPlatform;
}[] = [
  {
    label: 'Instagram',
    href: brand.social.instagram,
    icon: 'instagram',
  },
  {
    label: 'TikTok',
    href: brand.social.tiktok,
    icon: 'tiktok',
  },
  {
    label: 'LinkedIn',
    href: brand.social.linkedin,
    icon: 'linkedin',
  },
  {
    label: 'Facebook',
    href: brand.social.facebook,
    icon: 'facebook',
  },
  {
    label: 'YouTube',
    href: brand.social.youtube,
    icon: 'youtube',
  },
  {
    label: 'WhatsApp',
    href: brand.whatsappUrl,
    icon: 'whatsapp',
  },
];

function SocialIcon({ type }: { type: SocialPlatform }) {
  switch (type) {
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="19"
          height="19"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={siTiktok.path} />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          width="19"
          height="19"
          aria-hidden="true"
        >
          <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.5 9h3.4v12H3.5V9Zm5.7 0h3.3v1.6h.1A3.7 3.7 0 0 1 16 8.7c3.6 0 4.3 2.3 4.3 5.3v7h-3.5v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9.2V9Z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={siYoutube.path} />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={siWhatsapp.path} />
        </svg>
      );

    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          width="19"
          height="19"
          aria-hidden="true"
        >
          <path d="M14 21v-8h2.7l.4-3.2H14V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.3H8V13h2.6v8H14Z" />
        </svg>
      );
  }
}

type PortalInfo = {
  label: string;
  href: string | null;
};

function getPortalInfo(user: User | null): PortalInfo {
  if (!user) {
    return {
      label: 'Log in',
      href: '/login',
    };
  }

  if (user.role === 'admin') {
    return {
      label: 'Admin Dashboard',
      href: '/admin',
    };
  }

  if (user.role === 'client') {
    return {
      label: 'My Dashboard',
      href: '/dashboard',
    };
  }

  return {
    label: 'Team Account',
    href: '/team',
  };
}

export function SiteLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const publicPage = isPublicPath(location.pathname);
  usePublicMotion(mainRef, headerRef, footerRef, location.pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const { user: currentUser, status } = useAuth();
  const authLoading = status === 'loading';

  const portal = getPortalInfo(currentUser);

  // Close mobile navigation and handle page scrolling.
  useEffect(() => {
    setMenuOpen(false);

    if (location.hash) {
      const targetId = decodeURIComponent(
        location.hash.slice(1),
      );

      const frame = requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: window.matchMedia?.(reducedMotion).matches ? 'instant' : 'smooth',
          block: 'start',
        });
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [location.pathname, location.hash]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* NAVBAR */}
      <header ref={headerRef} className="header ds-nav-v3 ds-nav-v7" data-motion-shell={publicPage || undefined}>
        {publicPage && <span className="ds-navigation-trace" aria-hidden="true" />}
        <Link
          to="/"
          className="ds-brand-v3"
          aria-label={`${brand.name} home`}
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark />

          <span className="ds-brand-name">
            Dark <strong>Synapses</strong>
          </span>
        </Link>

        <button
          type="button"
          className="ds-menu-toggle"
          aria-label={
            menuOpen
              ? 'Close navigation'
              : 'Open navigation'
          }
          aria-expanded={menuOpen}
          aria-controls="dark-synapses-main-nav"
          onClick={() => {
            setMenuOpen((previous) => !previous);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="dark-synapses-main-nav"
          className={`ds-nav-links ${
            menuOpen ? 'is-open' : ''
          }`}
          aria-label="Main navigation"
        >
          {publicPage && <span className="ds-nav-highlight" aria-hidden="true" />}
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </NavLink>

          <NavLink
            to="/services"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </NavLink>

          <NavLink to="/projects" onClick={() => setMenuOpen(false)}>
            Projects
          </NavLink>

          <NavLink
            to="/#tech-news"
            onClick={() => setMenuOpen(false)}
          >
            Tech News
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </NavLink>

          {/* Portal link inside mobile navigation */}
          {!authLoading &&
            (portal.href ? (
              <Link
                className="ds-mobile-portal"
                to={portal.href}
                onClick={() => setMenuOpen(false)}
              >
                {portal.label}
              </Link>
            ) : (
              <span className="ds-mobile-portal-label">
                {portal.label}
              </span>
            ))}

          <Link
            className="ds-mobile-contact" data-public-cta="primary"
            to="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Get in Touch
          </Link>
        </nav>

        {!authLoading && currentUser && (
          <NotificationBell
            key={currentUser.id}
            userId={currentUser.id}
          />
        )}

        {/* Portal link on desktop */}
        {!authLoading &&
          (portal.href ? (
            <Link
              className="ds-portal-link"
              to={portal.href}
            >
              {portal.label}
            </Link>
          ) : (
            <span className="ds-portal-label">
              {portal.label}
            </span>
          ))}

        <Link className="ds-nav-cta" data-public-cta="primary" to="/contact">
          Get in Touch
        </Link>
      </header>

      {/* PAGE CONTENT */}
      <main id="main" ref={mainRef} data-motion-content={publicPage || undefined}>
        {publicPage && <div className="ds-pointer-halo" aria-hidden="true" />}
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer ref={footerRef} className="footer ds-footer-v3 ds-footer-v7" data-motion-shell={publicPage || undefined}>
        {publicPage && <FooterNetwork />}
        <div className="ds-footer-v7-main">
          {/* COMPANY IDENTITY */}
          <div className="ds-footer-v7-identity">
            <Link
              to="/"
              className="ds-brand-v3"
              aria-label={`${brand.name} home`}
            >
              <BrandMark />

              <span className="ds-brand-name">
                Dark <strong>Synapses</strong>
              </span>
            </Link>

            <p>{brand.slogan}</p>

            <div
              className="ds-footer-social"
              aria-label={`${brand.name} social media`}
            >
              {socialLinks.map(
                ({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in new tab)`}
                    title={label}
                  >
                    <SocialIcon type={icon} />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* EXPLORE */}
          <div className="ds-footer-v7-column">
            <h2>Explore</h2>

            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/#tech-news">Tech News</Link>
            <Link to="/contact">Contact</Link>
          </div>

          {/* CONTACT */}
          <div className="ds-footer-v7-contact">
            <h2>Connect with us</h2>

            <p>
              Have an AI or cybersecurity project in mind?
              We'd love to hear about it.
            </p>

            <a href={`mailto:${brand.email}`}>
              {brand.email}
            </a>

          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="ds-footer-v7-bottom">
          <span>
            © {new Date().getFullYear()} {brand.name}.
            {' '}All rights reserved.
          </span>

          <span>
            AI Engineering · Cybersecurity ·
            Intelligent Defense
          </span>
        </div>
      </footer>
    </>
  );
}
