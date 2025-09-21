import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserContext, saveUserContext } from '../data-layer/userContextStorage';
import styles from './ResponsePage.module.css';

const ResponsePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result] = useState<{ mainTask: string; reasoning: string }>(location.state?.result || { mainTask: '', reasoning: '' });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!result.mainTask) {
      navigate('/');
    }
  }, [result, navigate]);

  async function onTaskCompleted(checked: boolean): Promise<void> {
    setIsCompleted(checked);
    if (checked) {
      const userContext = await getUserContext();
      const updatedContext = {
        ...userContext,
        completedToDo: [...(userContext.completedToDo || []), result.mainTask],
        predictedToDo: (userContext.predictedToDo || []).filter(task => task !== result.mainTask)
      };
      await saveUserContext(updatedContext);
    }
  }

  return (
    <div className={styles.container}>
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
        <div className={styles.responseButtons}>
          <button className={`${styles.roundButton} ${styles.interactButton}`} onClick={() => navigate('/chat')}>Interact with Me</button>
          <button className={`${styles.roundButton} ${styles.predictButton}`} onClick={() => navigate('/')}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;