import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../components/SiteLayout';
import { HomePage } from '../pages/HomePage';
import { ServicesPage } from '../pages/ServicesPage';
import { SystemPage } from '../pages/SystemPage';

export function App() {
  return <Routes><Route element={<SiteLayout />}>
    <Route index element={<HomePage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="expertise" element={<ServicesPage />} />
    <Route path="system" element={<SystemPage />} />
    <Route path="*" element={<section className="section"><h1>Page not found.</h1><a href="/">Back to home</a></section>} />
  </Route></Routes>;
}
