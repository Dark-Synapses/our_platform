import { Link, NavLink, Outlet } from 'react-router-dom';

export function SiteLayout() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header">
      <Link to="/" className="brand" aria-label="Dark Synapses home">
        <img src="/images/logo.png" alt="" /><span>Dark <span>Synapses</span></span>
      </Link>
      <nav aria-label="Main navigation"><NavLink to="/about">About</NavLink><NavLink to="/expertise">Expertise</NavLink><a href="/#approach">Our approach</a><NavLink to="/contact">Contact</NavLink><NavLink to="/system">System status</NavLink></nav>
    </header>
    <main id="main"><Outlet /></main>
    <footer className="footer"><span>Where Intelligence Meets Threats.</span><span>Dark Synapses · Foundation release</span></footer>
  </>;
}
