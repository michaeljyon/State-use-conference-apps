import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/archivo/latin-700.css';
import '@fontsource/archivo/latin-800.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-700.css';
import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-700.css';
import './styles.css';
import App from './App.jsx';
import { applyBrand } from './lib/config.js';

applyBrand();
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
