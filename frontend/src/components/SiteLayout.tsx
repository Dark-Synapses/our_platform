import { Link, NavLink, Outlet } from 'react-router-dom';

export function SiteLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="header ds-nav-v3">
        <Link
          to="/"
          className="ds-brand-v3"
          aria-label="Dark Synapses home"
        >
          <img
            src="/images/logo.png"
            alt=""
          />
          <span className="ds-brand-name">
            Dark <strong>Synapses</strong>
          </span>
        </Link>

        <nav className="ds-nav-links" aria-label="Main navigation">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/expertise">Expertise</NavLink>
          <a href="/#approach">Our Approach</a>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <Link className="ds-nav-cta" to="/contact">
          Get in Touch <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="footer ds-footer-v3">
        <div className="ds-footer-brand">
          <img src="/images/logo.png" alt="Dark Synapses" />
          <p>Intelligent Systems. Secure by Design.</p>
        </div>

        <div className="ds-footer-links">
          <Link to="/about">About</Link>
          <Link to="/expertise">Expertise</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <span>
          © {new Date().getFullYear()} Dark Synapses.
        </span>
      </footer>
    </>
  );
}
