import AdminRequestDetailsPage from '../pages/AdminRequestDetailsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ServiceRequestsPage from '../pages/ServiceRequestsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ClientDashboardPage from '../pages/ClientDashboardPage';
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
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="admin/requests/:requestId" element={<AdminRequestDetailsPage />} />
        <Route path="service-requests" element={<ServiceRequestsPage />} />

    <Route path="about" element={<AboutPage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="expertise" element={<ServicesPage />} />
    <Route path="system" element={<SystemPage />} />
    <Route path="*" element={<section className="section"><h1>Page not found.</h1><a href="/">Back to home</a></section>} />
  </Route></Routes>;
}
