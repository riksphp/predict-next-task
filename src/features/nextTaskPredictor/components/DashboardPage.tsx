import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserContext, ContextData } from '../data-layer/userContextStorage';
import { getUserProfile, UserProfile } from '../data-layer/userProfileStorage';
import { getUserAnalysis, UserAnalysis } from '../services/analysisService';
import { getPredictedTasks, getCompletedTasks } from '../data-layer/taskStorage';
import {
  getUserScore,
  getScoreHistory,
  type UserScore,
  type ScoreEntry,
} from '../data-layer/scoreStorage';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [latestContext, setLatestContext] = useState<ContextData>({});
  const [userAnalysis, setUserAnalysis] = useState<UserAnalysis | null>(null);
  const [predictedTasks, setPredictedTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    loadUserContext();
  }, []);

  async function loadUserContext() {
    const profile = await getUserProfile();
    setUserProfile(profile);

    const context = await getUserContext();
    // Get the latest context entry
    const timestamps = Object.keys(context).sort().reverse();
    const latest = timestamps.length > 0 ? context[timestamps[0]] : {};
    setLatestContext(latest);

    const analysis = await getUserAnalysis();
    setUserAnalysis(analysis);

    const predicted = await getPredictedTasks();
    setPredictedTasks(predicted);

    const completed = await getCompletedTasks();
    setCompletedTasks(completed);

    const score = await getUserScore();
    setUserScore(score);

    const history = await getScoreHistory();
    setScoreHistory(history);
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
        {userScore && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Progress 🏆</h2>
            <div className={styles.card}>
              <div className={styles.scoreOverview}>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreLabel}>Level</span>
                  <span className={styles.scoreValue}>{userScore.level}</span>
                </div>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreLabel}>Total Points</span>
                  <span className={styles.scoreValue}>{userScore.totalPoints}</span>
                </div>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreLabel}>Tasks Completed</span>
                  <span className={styles.scoreValue}>{userScore.completedTasks}</span>
                </div>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreLabel}>Average Score</span>
                  <span className={styles.scoreValue}>{userScore.averageScore}%</span>
                </div>
              </div>

              {scoreHistory.length > 0 && (
                <div className={styles.recentScores}>
                  <h3>Recent Scores</h3>
                  {scoreHistory.slice(0, 5).map((entry) => (
                    <div key={entry.id} className={styles.scoreEntry}>
                      <div className={styles.scoreEntryHeader}>
                        <span className={styles.taskName}>{entry.task.substring(0, 50)}...</span>
                        <span className={styles.scorePoints}>
                          {entry.score}/{entry.maxScore} pts
                        </span>
                      </div>
                      <div className={styles.scoreCategory}>
                        {entry.category} • {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>User Profile</h2>
          <div className={styles.card}>
            <p>
              <strong>Name:</strong> {userProfile.name || latestContext.name || 'Not provided'}
            </p>
            <p>
              <strong>Profession:</strong>{' '}
              {userProfile.profession || latestContext.profession || 'Not provided'}
            </p>
            <p>
              <strong>Mood:</strong> {userProfile.mood || latestContext.mood || 'Not provided'}
            </p>
            <p>
              <strong>Work Style:</strong> {userProfile.workStyle || 'Not provided'}
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Predicted Tasks ({predictedTasks.length})</h2>
          <div className={styles.card}>
            {predictedTasks.length > 0 ? (
              <ul className={styles.list}>
                {predictedTasks.map((task, index) => (
                  <li key={index} className={styles.listItem}>
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No predicted tasks yet</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Todos ({(latestContext.todos || []).length})</h2>
          <div className={styles.card}>
            {(latestContext.todos || []).length > 0 ? (
              <ul className={styles.list}>
                {latestContext.todos?.map((todo, index) => (
                  <li key={index} className={styles.listItem}>
                    {todo}
                  </li>
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
                  <li key={index} className={styles.completedItem}>
                    {task}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No completed tasks yet</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Quick Notes ({(latestContext.quickNotes || []).length})
          </h2>
          <div className={styles.card}>
            {(latestContext.quickNotes || []).length > 0 ? (
              <ul className={styles.list}>
                {latestContext.quickNotes?.map((note, index) => (
                  <li key={index} className={styles.listItem}>
                    {note}
                  </li>
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
              <p>
                <strong>Work Style:</strong> {userAnalysis.workStyle}
              </p>
              <p>
                <strong>Patterns:</strong>
              </p>
              <ul className={styles.list}>
                {userAnalysis.patterns.map((pattern, index) => (
                  <li key={index} className={styles.listItem}>
                    {pattern}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Interests:</strong>
              </p>
              <ul className={styles.list}>
                {userAnalysis.interests.map((interest, index) => (
                  <li key={index} className={styles.listItem}>
                    {interest}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Priorities:</strong>
              </p>
              <ul className={styles.list}>
                {userAnalysis.priorities.map((priority, index) => (
                  <li key={index} className={styles.listItem}>
                    {priority}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Suggestions:</strong>
              </p>
              <ul className={styles.list}>
                {userAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className={styles.listItem}>
                    {suggestion}
                  </li>
                ))}
              </ul>
              <p className={styles.emptyState}>
                Last analyzed: {new Date(userAnalysis.lastAnalyzed).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
