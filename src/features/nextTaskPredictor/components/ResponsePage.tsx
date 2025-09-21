import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserContextStore } from '../data-store/userContextStore';
import '../../../popup.css';

const ResponsePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { context, setContext } = useUserContextStore();
  const [result] = useState<{ mainTask: string; reasoning: string }>(location.state?.result || { mainTask: '', reasoning: '' });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!result.mainTask) {
      navigate('/');
    }
  }, [result, navigate]);

  function onTaskCompleted(checked: boolean): void {
    setIsCompleted(checked);
    if (checked) {
      const completedTask = `Completed: ${result.mainTask}`;
      const updatedContext = context ? `${context}\n${completedTask}` : completedTask;
      setContext(updatedContext);
    }
  }

  return (
    <div className="popup-container">
      <div className="response-container">
        <div className="response-text">
          <div className="main-task">{result.mainTask}</div>
          <div className="reasoning">{result.reasoning}</div>
        </div>
        <div className="task-completion">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onTaskCompleted(e.target.checked)}
            />
            <span className="checkmark"></span>
            Task Completed
          </label>
        </div>
        <div className="response-buttons">
          <button className="round-button interact-button">Interact with Me</button>
          <button className="round-button predict-button" onClick={() => navigate('/')}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;