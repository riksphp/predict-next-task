import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

type ScoreEntry = {
  id: string;
  task: string;
  timestamp: number | string;
  score: number;
  maxScore: number;
  category: string;
};

export default function RecentScoresWidget({ entries }: { entries: ScoreEntry[] }) {
  const recentScores = entries.slice(0, 5);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#f44336';
  };

  return (
    <div className={`${styles.widget} ${styles.scoresWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>🎯 Recent Scores</h3>
      </div>
      <div className={styles.scoresList}>
        {recentScores.length > 0 ? (
          recentScores.map((entry) => (
            <div key={entry.id} className={styles.scoreItem}>
              <div className={styles.scoreTask}>
                <div className={styles.taskTitle}>{entry.task.substring(0, 40)}...</div>
                <div className={styles.taskDate}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.scoreValue}>
                <span
                  className={styles.scorePoints}
                  style={{ color: getScoreColor((entry.score / entry.maxScore) * 100) }}
                >
                  {entry.score}/{entry.maxScore}
                </span>
                <span className={styles.scoreCategory}>{entry.category}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Complete interactive tasks to see your scores!</p>
          </div>
        )}
      </div>
    </div>
  );
}
