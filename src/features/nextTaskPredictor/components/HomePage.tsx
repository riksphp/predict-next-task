import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../hooks/usePrediction';
import '../../../popup.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { loading, predict } = usePrediction();

  async function onPredict(): Promise<void> {
    const result = await predict();
    navigate('/response', { state: { result } });
  }

  return (
    <div className="popup-container">
      <div className="star">✨</div>
      <div className="greeting">Hi, I am your personal assistant</div>
      <div className="buttons-container">
        <button className="round-button predict-button" onClick={onPredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Next Task'}
        </button>
        <button className="round-button interact-button">Interact with Me</button>
      </div>
    </div>
  );
};

export default HomePage;