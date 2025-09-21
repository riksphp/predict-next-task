import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import Popup from './features/nextTaskPredictor/components/Popup';
import { UserContextProvider } from './features/nextTaskPredictor/data-store/userContextStore';
import { ThemeProvider } from './features/nextTaskPredictor/data-store/themeStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserContextProvider>
        <Popup />
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
