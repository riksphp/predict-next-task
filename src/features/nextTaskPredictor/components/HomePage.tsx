import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROMPTS } from '../data-layer/prompts';
import styles from './HomePage.module.css';
import {} from '../../../agent';

const HomePage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  async function handleSubmit(): Promise<void> {
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
        <div className={styles.headline}>Your AI copilot for focused progress</div>
        <div className={styles.subheadline}>
          Plan smarter, ship faster, and stay in flow—one task at a time.
        </div>
      </div>

      <div className={styles.middle}>
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
        <div className={styles.inputLabel}>{PROMPTS.INPUT_LABEL}</div>

        <div className={styles.secondaryActions}>
          <button className={styles.settingsButton} onClick={() => navigate('/ai-settings')}>
            🤖 AI Settings
          </button>
          <button className={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
