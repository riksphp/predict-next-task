import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../data-layer/userProfileStorage';
import { getUserScore, type UserScore } from '../data-layer/scoreStorage';
import styles from './ScoreWidget.module.css';

const ScoreWidget = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Poll for score updates every 30 seconds when visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [profile, score] = await Promise.all([getUserProfile(), getUserScore()]);

      setUserName(profile.name || 'User');
      setUserScore(score);
    } catch (error) {
      console.error('Failed to load score widget data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    navigate('/dashboard');
  }

  if (loading) {
    return (
      <div className={styles.scoreWidget}>
        <div className={styles.loading}>...</div>
      </div>
    );
  }

  return (
    <div className={styles.scoreWidget} onClick={handleClick}>
      <div className={styles.userInfo}>
        <div className={styles.userName}>👋 {userName}</div>
        <div className={styles.userLevel}>Level {userScore?.level || 1}</div>
      </div>
      <div className={styles.scoreInfo}>
        <div className={styles.totalPoints}>{userScore?.totalPoints || 0}</div>
        <div className={styles.pointsLabel}>pts</div>
      </div>
    </div>
  );
};

export default ScoreWidget;
