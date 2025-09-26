import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

type UserScore = {
  totalPoints: number;
  level: number;
  completedTasks: number;
  averageScore: number;
};

export default function ScoreOverviewWidget({ userScore }: { userScore: UserScore | null }) {
  return (
    <div className={`${styles.widget} ${styles.scoreWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>🏆 Your Score</h3>
      </div>
      {userScore ? (
        <div className={styles.scoreContent}>
          <div className={styles.scoreMain}>
            <div className={styles.totalPoints}>{userScore.totalPoints}</div>
            <div className={styles.pointsLabel}>Total Points</div>
          </div>
          <div className={styles.scoreStats}>
            <div className={styles.scoreStat}>
              <span className={styles.statValue}>Level {userScore.level}</span>
              <span className={styles.statLabel}>Current Level</span>
            </div>
            <div className={styles.scoreStat}>
              <span className={styles.statValue}>{userScore.completedTasks}</span>
              <span className={styles.statLabel}>Tasks Done</span>
            </div>
            <div className={styles.scoreStat}>
              <span className={styles.statValue}>{userScore.averageScore}%</span>
              <span className={styles.statLabel}>Avg Score</span>
            </div>
          </div>
          <div className={styles.levelProgress}>
            <div className={styles.progressLabel}>Progress to Level {userScore.level + 1}</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${userScore.totalPoints % 100}%` }}
              ></div>
            </div>
            <div className={styles.progressText}>{userScore.totalPoints % 100}/100 points</div>
            <div className={styles.levelInfo}>
              Level {userScore.level} • {userScore.totalPoints} total points
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Start completing tasks to earn points!</p>
        </div>
      )}
    </div>
  );
}
