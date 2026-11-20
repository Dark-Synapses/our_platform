import { KarenChat } from "./components/karen/KarenChat";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { AuthProvider } from './components/auth/AuthProvider';
import { SeoManager } from './components/seo/SeoManager';
import './styles/tokens.css';
import './styles/global.css';
import './styles/redesign.css';
import './styles/technical.css';
import './styles/technical-v3.css';
import './styles/services-v2.css';
import './styles/premium-v5.css';
import './styles/contact-v8.css';
import './styles/reference-v6.css';

import './styles/service-cards.css';

import './styles/brand-v7.css';
import './styles/public-motion.css';

// import './styles/retro-terminal-v2.css';

import './styles/home-retro.css';

import './styles/home-pixel-v3.css';

import './styles/home-pixel-refinement.css';

import './styles/pixel-v4.css';
import './styles/pixel-v5-shell.css';
import './styles/pixel-v7-target.css';
import './styles/v10-open-layout.css';
import './styles/ds-v10-unified-motion.css';
import './styles/ds-navbar-motion-fix.css';
import './styles/contact-pixel-v13.css';
import './styles/contact-home-consistency-v14.css';
import './styles/contact-soft-pixel.css';
import './styles/contact-reference-v18.css';
createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><AuthProvider><SeoManager /><App /><KarenChat /></AuthProvider></BrowserRouter></StrictMode>,
);
import './styles/ds-global-buttons.css';
import './styles/ds-login-final.css';


import './styles/ds-editorial-atmosphere-v15.css';

import './styles/ds-global-pixels-v17.css';
