import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ResponsePage from './ResponsePage';
import ChatPage from './ChatPage';
import DashboardPage from './DashboardPage';

const Popup = () => {
  return (
    <Router initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/response" element={<ResponsePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
};

export default Popup;
