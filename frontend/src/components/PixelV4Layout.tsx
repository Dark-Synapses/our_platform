import { PixelSocialIcon } from './PixelSocialIcon';
import { NotificationBell } from './NotificationBell';
import { brand } from '../content/brand';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/#expertise', label: 'Expertise' },
  { to: '/projects', label: 'Projects' },
  { to: '/#about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function PixelV4Layout() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/') return;

    const home = document.querySelector<HTMLElement>('.ds-v10-public .px4-home');
    if (!home) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = Array.from(home.querySelectorAll<HTMLElement>(
      '.px4-hero-copy, .px4-art, .ds-content-intro, .ds-v9-service .ds-v9-visual, .ds-v9-service .ds-v9-info, .ds-content-statement, .ds-content-section-heading, .ds-content-principles article, .ds-content-phases article, .ds-content-links'
    ));

    const animations: Animation[] = [];
    let observer: IntersectionObserver | undefined;

    if (!reduced && 'IntersectionObserver' in window) {
      const reveal = (el: HTMLElement) => {
        el.style.removeProperty('opacity');
        const animation = el.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: 480,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both'
          }
        );
        animations.push(animation);
        animation.addEventListener('finish', () => {
          el.style.removeProperty('opacity');
          animation.cancel();
        }, { once: true });
      };

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer?.unobserve(entry.target);
        }
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      });

      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.style.removeProperty('opacity');
          if (rect.bottom > 0) reveal(el);
        } else {
          el.style.setProperty('opacity', '0', 'important');
          observer.observe(el);
        }
      }
    }

    return () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      targets.forEach(el => el.style.removeProperty('opacity'));
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, location.hash]);

  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const portal = user?.role === 'admin' ? '/admin' : user?.role === 'team' ? '/team' : user ? '/dashboard' : '/login';
  return (
    <div className={`pixel-v4 ds-v6 ${!location.pathname.startsWith("/admin") && !["/dashboard", "/service-requests", "/team", "/system"].some(p => location.pathname === p || location.pathname.startsWith(p + "/")) ? "ds-v10-public" : ""}`}>
      <div className="ds-global-pixels-v17" aria-hidden="true">
          <span className="ds-pixel" style={{left: "3%", top: "17%", animationDuration: "13s", animationDelay: "0s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "8%", top: "46%", animationDuration: "20s", animationDelay: "-11s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "13%", top: "75%", animationDuration: "27s", animationDelay: "-22s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "19%", top: "4%", animationDuration: "19s", animationDelay: "-8s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "24%", top: "33%", animationDuration: "26s", animationDelay: "-19s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "30%", top: "62%", animationDuration: "18s", animationDelay: "-5s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "35%", top: "91%", animationDuration: "25s", animationDelay: "-16s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "41%", top: "20%", animationDuration: "17s", animationDelay: "-2s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "47%", top: "49%", animationDuration: "24s", animationDelay: "-13s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "52%", top: "78%", animationDuration: "16s", animationDelay: "-24s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "58%", top: "7%", animationDuration: "23s", animationDelay: "-10s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "63%", top: "36%", animationDuration: "15s", animationDelay: "-21s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "69%", top: "65%", animationDuration: "22s", animationDelay: "-7s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "74%", top: "94%", animationDuration: "14s", animationDelay: "-18s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "79%", top: "23%", animationDuration: "21s", animationDelay: "-4s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "84%", top: "52%", animationDuration: "13s", animationDelay: "-15s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "90%", top: "81%", animationDuration: "20s", animationDelay: "-1s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "96%", top: "10%", animationDuration: "27s", animationDelay: "-12s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "6%", top: "39%", animationDuration: "19s", animationDelay: "-23s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "16%", top: "68%", animationDuration: "26s", animationDelay: "-9s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "27%", top: "97%", animationDuration: "18s", animationDelay: "-20s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "38%", top: "26%", animationDuration: "25s", animationDelay: "-6s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "49%", top: "55%", animationDuration: "17s", animationDelay: "-17s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "60%", top: "84%", animationDuration: "24s", animationDelay: "-3s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "71%", top: "13%", animationDuration: "16s", animationDelay: "-14s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "82%", top: "42%", animationDuration: "23s", animationDelay: "0s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "93%", top: "71%", animationDuration: "15s", animationDelay: "-11s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "11%", top: "0%", animationDuration: "22s", animationDelay: "-22s", width: "4px", height: "4px"}} />
          <span className="ds-pixel" style={{left: "33%", top: "29%", animationDuration: "14s", animationDelay: "-8s", width: "2px", height: "2px"}} />
          <span className="ds-pixel" style={{left: "55%", top: "58%", animationDuration: "21s", animationDelay: "-19s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "77%", top: "87%", animationDuration: "13s", animationDelay: "-5s", width: "3px", height: "3px"}} />
          <span className="ds-pixel" style={{left: "88%", top: "16%", animationDuration: "20s", animationDelay: "-16s", width: "4px", height: "4px"}} />
      </div>
      <div className="ds-v6-frame">
        <header className="px4-header">
          <div className="px4-header-inner">
          <Link className="px4-brand" to="/" aria-label="Dark Synapses home">
            <img className="px5-logo" src="/images/ds-animated-logo.svg" alt="Dark Synapses" />
          </Link>
          <button type="button" className="px4-menu" aria-expanded={menuOpen} aria-controls="px4-navigation" onClick={() => setMenuOpen(!menuOpen)}>MENU {menuOpen ? '−' : '+'}</button>
          <nav id="px4-navigation" className={menuOpen ? 'px4-nav open' : 'px4-nav'} aria-label="Main navigation">
            {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenuOpen(false)} className={({isActive}) => item.to.includes('#') ? (location.pathname === '/' && location.hash === '#' + item.to.split('#')[1] ? 'active' : '') : (isActive && !location.hash ? 'active' : '')}>{item.label}</NavLink>)}
          </nav>
          <div className="ds-v6-account"><Link className="px4-portal" to={portal}>{user ? 'PORTAL' : 'LOG IN'}</Link>{user && <NotificationBell userId={user.id} />}</div>
          </div>
        </header>
        <main className="px4-main"><Outlet /></main>
        <footer className="px4-footer px5-footer">
          <div className="px5-footer-grid">
            <div className="px5-footer-identity">
              <Link to="/" className="px4-footer-brand"><img className="px5-footer-logo" src="/images/ds-animated-logo.svg" alt="Dark Synapses" /></Link>
              <p>AI × CYBERSECURITY × DIGITAL SYSTEMS</p>
            </div>
            <div className="px5-footer-column"><h2>[ EXPLORE ]</h2>{nav.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div>
            <div className="px5-footer-column"><h2>[ CONNECT ]</h2><a href={`mailto:${brand.email}`}>{brand.email}</a><a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a><div className="ds-v6-social">{Object.entries(brand.social).map(([name,url]) => url ? <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}><PixelSocialIcon name={name} /></a> : null)}</div></div>
          </div>
          <div className="px5-footer-bottom"><span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span><span>WHERE INTELLIGENCE MEETS THREATS_</span></div>
        </footer>
      </div>
    </div>
  );
}
