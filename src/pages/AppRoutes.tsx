import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Response from './Response';
import Chat from './Chat';
import Dashboard from './Dashboard';
import AISettings from './AISettings';

const AppRoutes = () => {
  return (
    <Router initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/response" element={<Response />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-settings" element={<AISettings />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
