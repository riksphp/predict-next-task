import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../features/nextTaskPredictor/components/HomePage';
import ResponsePage from '../features/nextTaskPredictor/components/ResponsePage';
import ChatPage from '../features/nextTaskPredictor/components/ChatPage';
import DashboardPage from '../features/nextTaskPredictor/components/DashboardPage';
import AISettingsPage from '../features/nextTaskPredictor/components/AISettingsPage';

const AppRoutes = () => {
  return (
    <Router initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/response" element={<ResponsePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-settings" element={<AISettingsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
