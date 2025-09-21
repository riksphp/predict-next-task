import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import ResponsePage from './ResponsePage';

const Popup = () => {
  return (
    <Router initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/response" element={<ResponsePage />} />
      </Routes>
    </Router>
  );
};

export default Popup;
