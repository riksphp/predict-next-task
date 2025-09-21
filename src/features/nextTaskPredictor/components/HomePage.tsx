import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../hooks/usePrediction';
import { PROMPTS } from '../data-layer/prompts';
import { getUserContext, saveUserContext } from '../data-layer/userContextStorage';
import styles from './HomePage.module.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { loading, predict } = usePrediction();
  const [input, setInput] = useState('');

  async function onPredict(): Promise<void> {
    const result = await predict();
    navigate('/response', { state: { result } });
  }

  async function handleSubmit(): Promise<void> {
    if (input.trim()) {
      const message = input.trim();
      const userContext = await getUserContext();
      const updatedContext = {
        ...userContext,
        quickNotes: [...(userContext.quickNotes || []), message]
      };
      await saveUserContext(updatedContext);
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
            placeholder={PROMPTS.INPUT_PLACEHOLDER}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.submitButton} onClick={handleSubmit}>
            ↑
          </button>
        </div>
        <div className={styles.inputLabel}>
          {PROMPTS.INPUT_LABEL}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
