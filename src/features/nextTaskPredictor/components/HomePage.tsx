import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../hooks/usePrediction';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { loading, predict } = usePrediction();
  const [input, setInput] = useState('');

  async function onPredict(): Promise<void> {
    const result = await predict();
    navigate('/response', { state: { result } });
  }

  function handleSubmit(): void {
    if (input.trim()) {
      const message = input.trim();
      setInput('');
      navigate('/chat', { state: { initialMessage: message } });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.star}>✨</div>
        <div className={styles.greeting}>Hi, I am your personal assistant</div>
      </div>

      <div className={styles.middle}>
        <button className={styles.primaryButton} onClick={onPredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Next Task'}
        </button>
      </div>

      <div className={styles.bottom}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.inputBox}
            placeholder="Type anything... todos, ideas, thoughts"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.submitButton} onClick={handleSubmit}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
