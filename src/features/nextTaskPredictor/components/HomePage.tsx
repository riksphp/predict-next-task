import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../hooks/usePrediction';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { loading, predict } = usePrediction();

  async function onPredict(): Promise<void> {
    const result = await predict();
    navigate('/response', { state: { result } });
  }

  return (
    <div className={styles.container}>
      <div className={styles.star}>✨</div>
      <div className={styles.greeting}>Hi, I am your personal assistant</div>
      <div className={styles.buttonsContainer}>
        <button className={`${styles.roundButton} ${styles.predictButton}`} onClick={onPredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Next Task'}
        </button>
        <button className={`${styles.roundButton} ${styles.interactButton}`} onClick={() => navigate('/chat')}>Interact with Me</button>
      </div>
    </div>
  );
};

export default HomePage;