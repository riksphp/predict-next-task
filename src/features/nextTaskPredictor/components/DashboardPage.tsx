import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserContext, UserContext } from '../data-layer/userContextStorage';
import { getUserAnalysis, UserAnalysis } from '../services/analysisService';
import { getPredictedTasks, getCompletedTasks } from '../data-layer/taskStorage';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userContext, setUserContext] = useState<UserContext>({});
  const [userAnalysis, setUserAnalysis] = useState<UserAnalysis | null>(null);
  const [predictedTasks, setPredictedTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    loadUserContext();
  }, []);

  async function loadUserContext() {
    const context = await getUserContext();
    setUserContext(context);
    
    const analysis = await getUserAnalysis();
    setUserAnalysis(analysis);
    
    const predicted = await getPredictedTasks();
    setPredictedTasks(predicted);
    
    const completed = await getCompletedTasks();
    setCompletedTasks(completed);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ←
        </button>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>User Profile</h2>
          <div className={styles.card}>
            <p><strong>Name:</strong> {userContext.name || 'Not provided'}</p>
            <p><strong>Profession:</strong> {userContext.profession || 'Not provided'}</p>
            <p><strong>Mood:</strong> {userContext.mood || 'Not provided'}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Predicted Tasks ({predictedTasks.length})</h2>
          <div className={styles.card}>
            {predictedTasks.length > 0 ? (
              <ul className={styles.list}>
                {predictedTasks.map((task, index) => (
                  <li key={index} className={styles.listItem}>{task}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No predicted tasks yet</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Todos ({(userContext.todos || []).length})</h2>
          <div className={styles.card}>
            {(userContext.todos || []).length > 0 ? (
              <ul className={styles.list}>
                {userContext.todos?.map((todo, index) => (
                  <li key={index} className={styles.listItem}>{todo}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No todos yet</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Completed Tasks ({completedTasks.length})</h2>
          <div className={styles.card}>
            {completedTasks.length > 0 ? (
              <ul className={styles.list}>
                {completedTasks.map((task, index) => (
                  <li key={index} className={styles.completedItem}>{task}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No completed tasks yet</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Notes ({(userContext.quickNotes || []).length})</h2>
          <div className={styles.card}>
            {(userContext.quickNotes || []).length > 0 ? (
              <ul className={styles.list}>
                {userContext.quickNotes?.map((note, index) => (
                  <li key={index} className={styles.listItem}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No quick notes yet</p>
            )}
          </div>
        </div>

        {userAnalysis && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>User Analysis</h2>
            <div className={styles.card}>
              <p><strong>Work Style:</strong> {userAnalysis.workStyle}</p>
              <p><strong>Patterns:</strong></p>
              <ul className={styles.list}>
                {userAnalysis.patterns.map((pattern, index) => (
                  <li key={index} className={styles.listItem}>{pattern}</li>
                ))}
              </ul>
              <p><strong>Interests:</strong></p>
              <ul className={styles.list}>
                {userAnalysis.interests.map((interest, index) => (
                  <li key={index} className={styles.listItem}>{interest}</li>
                ))}
              </ul>
              <p><strong>Priorities:</strong></p>
              <ul className={styles.list}>
                {userAnalysis.priorities.map((priority, index) => (
                  <li key={index} className={styles.listItem}>{priority}</li>
                ))}
              </ul>
              <p><strong>Suggestions:</strong></p>
              <ul className={styles.list}>
                {userAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className={styles.listItem}>{suggestion}</li>
                ))}
              </ul>
              <p className={styles.emptyState}>Last analyzed: {new Date(userAnalysis.lastAnalyzed).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;