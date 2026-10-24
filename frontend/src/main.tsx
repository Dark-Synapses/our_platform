import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/redesign.css';
import './styles/technical.css';
import './styles/technical-v3.css';
import './styles/services-v2.css';
import './styles/premium-v5.css';
import './styles/contact-v8.css';
import './styles/reference-v6.css';
import './styles/home-services-premium.css';

import './styles/reference-cards-v6.css';

import './styles/brand-v7.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>,
);
