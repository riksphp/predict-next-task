import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

type UserProfile = { name?: string; profession?: string; mood?: string; workStyle?: string };

export default function ProfileInsightsWidget({
  profile,
  latestMood,
  insights,
}: {
  profile: UserProfile;
  latestMood?: string;
  insights?: string[];
}) {
  return (
    <div className={`${styles.widget} ${styles.profileWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>👤 Profile & Insights</h3>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileInfo}>
          <div className={styles.profileField}>
            <span className={styles.fieldLabel}>Name:</span>
            <span className={styles.fieldValue}>{profile.name || 'Not set'}</span>
          </div>
          <div className={styles.profileField}>
            <span className={styles.fieldLabel}>Profession:</span>
            <span className={styles.fieldValue}>{profile.profession || 'Not set'}</span>
          </div>
          <div className={styles.profileField}>
            <span className={styles.fieldLabel}>Current Mood:</span>
            <span className={styles.fieldValue}>
              {profile.mood || latestMood || 'Not specified'}
            </span>
          </div>
          <div className={styles.profileField}>
            <span className={styles.fieldLabel}>Work Style:</span>
            <span className={styles.fieldValue}>{profile.workStyle || 'Not analyzed'}</span>
          </div>
        </div>
        {insights && insights.length > 0 && (
          <div className={styles.insights}>
            <h4>🧠 AI Insights</h4>
            <div className={styles.insightTags}>
              {insights.slice(0, 3).map((pattern, index) => (
                <span key={index} className={styles.insightTag}>
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
