import ReactDOM from 'react-dom/client';
import './styles.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import Popup from './features/nextTaskPredictor/components/Popup';

// Detect Chrome extension environment
if (window.chrome && (window.chrome as any).runtime && (window.chrome as any).runtime.id) {
  document.documentElement.setAttribute('data-extension', 'true');
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Popup />);
