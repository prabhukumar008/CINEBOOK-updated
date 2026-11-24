import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/theme.css';
import './assets/styles/global.css';
import './assets/styles/responsive.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');
createRoot(rootElement).render(React.createElement(App));
