import ContentAuthenticityPage from '../pages/ContentAuthenticityPage';
import SecurityResearcherPage from '../pages/SecurityResearcherPage';
import AIPoweredSecurityPage from '../pages/AIPoweredSecurityPage';
import AISecurityServicePage from '../pages/AISecurityServicePage';
import CybersecurityServicePage from '../pages/CybersecurityServicePage';
import { AIServicePage } from '../pages/AIServicePage';
import AdminRequestDetailsPage from '../pages/AdminRequestDetailsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ServiceRequestsPage from '../pages/ServiceRequestsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ClientDashboardPage from '../pages/ClientDashboardPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../components/SiteLayout';
import { HomePage } from '../pages/HomePage';
import { ServicesPage } from '../pages/ServicesPage';
import { SystemPage } from '../pages/SystemPage';
import { ProjectsPage } from '../pages/ProjectsPage';

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
    <Route path="services" element={<ServicesPage />} />
    <Route path="expertise" element={<Navigate to="/services" replace />} />
    <Route path="projects" element={<ProjectsPage />} />
    <Route path="system" element={<SystemPage />} />
    <Route path="services/ai" element={<AIServicePage />} />
    <Route path="services/content-authenticity-digital-forensics" element={<ContentAuthenticityPage />} />
    <Route path="services/ai-powered-security" element={<AIPoweredSecurityPage />} />

    <Route path="services/ai-security" element={<AISecurityServicePage />} />
    <Route path="services/cybersecurity" element={<CybersecurityServicePage />} />
     <Route path="*" element={<section className="section"><h1>Page not found.</h1><a href="/">Back to home</a></section>} />
  </Route>
    <Route path="security-researcher" element={<SecurityResearcherPage />} />
      </Routes>;
}
