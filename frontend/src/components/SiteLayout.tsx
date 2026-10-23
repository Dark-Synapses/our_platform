
import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { getCurrentUser, type User } from '../lib/auth';
import { brand } from '../content/brand';

type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'facebook';

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
          fill="currentColor"
          width="19"
          height="19"
          aria-hidden="true"
        >
          <path d="M16.7 2h-3.1v13.1a3.1 3.1 0 1 1-2.7-3.1V8.8a6.3 6.3 0 0 0 4.7 1.5V6.8A5.3 5.3 0 0 1 16.7 2Z" />
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
    href: null,
  };
}

export function SiteLayout() {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [authLoading, setAuthLoading] = useState(true);

  const approachActive =
    location.pathname === '/' &&
    location.hash === '#approach';

  const portal = getPortalInfo(currentUser);

  // Check the existing backend session.
  useEffect(() => {
    let active = true;

    setAuthLoading(true);

    getCurrentUser()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (active) {
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  // Close mobile navigation and handle page scrolling.
  useEffect(() => {
    setMenuOpen(false);

    if (location.hash) {
      const targetId = decodeURIComponent(
        location.hash.slice(1),
      );

      const frame = requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
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
      <header className="header ds-nav-v3 ds-nav-v7">
        <Link
          to="/"
          className="ds-brand-v3"
          aria-label={`${brand.name} home`}
          onClick={() => setMenuOpen(false)}
        >
          <img src="/images/logo.png" alt="" />

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
            to="/expertise"
            onClick={() => setMenuOpen(false)}
          >
            Expertise
          </NavLink>

          <Link
            to="/#approach"
            className={
              approachActive ? 'active' : undefined
            }
            aria-current={
              approachActive ? 'location' : undefined
            }
            onClick={() => setMenuOpen(false)}
          >
            Our Approach
          </Link>

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
            className="ds-mobile-contact"
            to="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Get in Touch ↗
          </Link>
        </nav>

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

        <Link className="ds-nav-cta" to="/contact">
          Get in Touch
          <span aria-hidden="true">↗</span>
        </Link>
      </header>

      {/* PAGE CONTENT */}
      <main id="main">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="footer ds-footer-v3 ds-footer-v7">
        <div className="ds-footer-v7-main">
          {/* COMPANY IDENTITY */}
          <div className="ds-footer-v7-identity">
            <Link
              to="/"
              className="ds-brand-v3"
              aria-label={`${brand.name} home`}
            >
              <img src="/images/logo.png" alt="" />

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
            <Link to="/expertise">Expertise</Link>
            <Link to="/#approach">Our Approach</Link>
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

            <a
              href={brand.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: +20 101 457 9056 ↗
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
