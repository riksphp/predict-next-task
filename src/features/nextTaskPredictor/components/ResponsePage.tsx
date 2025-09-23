import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { completeTask } from '../data-layer/taskStorage';
import { PROMPTS } from '../data-layer/prompts';
import ScoreWidget from './ScoreWidget';
import styles from './ResponsePage.module.css';

const ResponsePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result] = useState<{ mainTask: string; reasoning: string }>(
    location.state?.result || { mainTask: '', reasoning: '' },
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');

  useEffect(() => {
    if (!result.mainTask) {
      navigate('/');
    }
  }, [result, navigate]);

  async function onTaskCompleted(checked: boolean): Promise<void> {
    setIsCompleted(checked);
    if (checked) {
      await completeTask(result.mainTask);
    }
  }

  function handleChatSubmit(): void {
    if (chatInput.trim()) {
      const message = chatInput.trim();
      setChatInput('');

      // Include task context in the message
      const taskContext = `I'm working on this task: "${result.mainTask}". ${message}`;

      navigate('/chat', {
        state: {
          initialMessage: taskContext,
          taskContext: {
            task: result.mainTask,
            reasoning: result.reasoning,
            userInput: message,
          },
        },
      });
    }
  }

  return (
    <div className={styles.container}>
      <ScoreWidget />
      <div className={styles.responseContainer}>
        <div className={styles.responseText}>
          <div className={styles.mainTask}>{result.mainTask}</div>
          <div className={styles.reasoning}>{result.reasoning}</div>
        </div>
        <div className={styles.taskCompletion}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onTaskCompleted(e.target.checked)}
            />
            <span className="checkmark"></span>
            Task Completed
          </label>
        </div>
        <div className={styles.chatSection}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.inputBox}
              placeholder={PROMPTS.CHAT_PLACEHOLDER}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
            />
            <button className={styles.submitButton} onClick={handleChatSubmit}>
              ↑
            </button>
          </div>
        </div>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;
