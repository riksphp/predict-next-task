import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserContext, ContextData } from '../data-layer/userContextStorage';
import { getUserProfile, UserProfile } from '../data-layer/userProfileStorage';
import { getUserAnalysis, UserAnalysis } from '../services/analysisService';
import { getPredictedTasks, getCompletedTasks, completeTask } from '../data-layer/taskStorage';
import {
  getUserScore,
  getScoreHistory,
  type UserScore,
  type ScoreEntry,
} from '../data-layer/scoreStorage';
import { getRecentCategoriesCount } from '../data-layer/taskCategoryStorage';
import { getGeneratedNotes, type GeneratedNote } from '../data-layer/notesStorage';
import { generateEducationalNote } from '../services/noteGenerationService';
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
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [generatingNote, setGeneratingNote] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [profile, context, analysis, predicted, completed, score, history, categories, notes] =
        await Promise.all([
          getUserProfile(),
          getUserContext(),
          getUserAnalysis(),
          getPredictedTasks(),
          getCompletedTasks(),
          getUserScore(),
          getScoreHistory(),
          getRecentCategoriesCount(168), // Last 7 days
          getGeneratedNotes(),
        ]);

      setUserProfile(profile);

      // Get the latest context entry
      const timestamps = Object.keys(context).sort().reverse();
      const latest = timestamps.length > 0 ? context[timestamps[0]] : {};
      setLatestContext(latest);

      setUserAnalysis(analysis);
      setPredictedTasks(predicted);
      setCompletedTasks(completed);
      setUserScore(score);
      setScoreHistory(history);
      setCategoryStats(categories);
      setGeneratedNotes(notes);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTodoComplete(todo: string, completed: boolean) {
    if (completed) {
      await completeTask(todo);
      // Remove from predicted tasks and refresh data
      setPredictedTasks((prev) => prev.filter((task) => task !== todo));
      // Refresh all data to get updated completed tasks
      await loadDashboardData();
    }
  }

  async function handleGenerateNote() {
    if (generatingNote) return;

    setGeneratingNote(true);
    try {
      const newNote = await generateEducationalNote();
      setGeneratedNotes((prev) => [newNote, ...prev]);
      // Auto-expand the newly generated note
      setExpandedNotes((prev) => new Set([...prev, newNote.id]));
    } catch (error) {
      console.error('Failed to generate note:', error);
    } finally {
      setGeneratingNote(false);
    }
  }

  function toggleNoteExpansion(noteId: string) {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#f44336';
  };

  const getProgressWidth = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentTodos = predictedTasks || [];
  const recentScores = scoreHistory.slice(0, 5);
  const categoryEntries = Object.entries(categoryStats).slice(0, 6);
  const recentCompletedTasks = completedTasks.slice(-5).reverse(); // Last 5 completed tasks

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ←
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {userProfile.name || 'there'}! Here's your progress overview.
          </p>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Score Widget */}
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

        {/* Predicted Tasks (Todos) */}
        <div className={`${styles.widget} ${styles.todoWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>📝 Predicted Tasks</h3>
            <span className={styles.badge}>{currentTodos.length}</span>
          </div>
          <div className={styles.todoList}>
            {currentTodos.length > 0 ? (
              currentTodos.map((todo, index) => (
                <div key={index} className={styles.todoItem}>
                  <label className={styles.todoCheckbox}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleTodoComplete(todo, e.target.checked)}
                    />
                    <span className={styles.checkmark}></span>
                  </label>
                  <span className={styles.todoText}>{todo}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No predicted tasks yet. Click "Predict Next Task" to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className={`${styles.widget} ${styles.todoWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>✅ Completed Tasks</h3>
            <span className={styles.badge}>{recentCompletedTasks.length}</span>
          </div>
          <div className={styles.todoList}>
            {recentCompletedTasks.length > 0 ? (
              recentCompletedTasks.map((task, index) => (
                <div key={index} className={styles.todoItem}>
                  <div className={styles.completedIcon}>✓</div>
                  <span className={styles.completedTaskText}>{task}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No completed tasks yet. Complete some tasks to see them here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Learning Notes */}
        <div className={`${styles.widget} ${styles.notesWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>📚 Learning Notes</h3>
            <div className={styles.headerActions}>
              <span className={styles.badge}>{generatedNotes.length}</span>
              <button
                className={styles.generateButton}
                onClick={handleGenerateNote}
                disabled={generatingNote}
              >
                {generatingNote ? '⏳' : '✨'} Generate Note
              </button>
            </div>
          </div>
          <div className={styles.notesList}>
            {generatedNotes.length > 0 ? (
              generatedNotes.slice(0, 5).map((note) => (
                <div key={note.id} className={styles.accordionItem}>
                  <div
                    className={styles.accordionHeader}
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    <div className={styles.accordionTitle}>
                      <span className={styles.noteIcon}>📖</span>
                      <span className={styles.noteTitleText}>{note.title}</span>
                    </div>
                    <div className={styles.accordionMeta}>
                      <span className={styles.noteCategory}>{note.category.replace('_', ' ')}</span>
                      <span className={styles.accordionToggle}>
                        {expandedNotes.has(note.id) ? '−' : '+'}
                      </span>
                    </div>
                  </div>
                  {expandedNotes.has(note.id) && (
                    <div className={styles.accordionContent}>
                      <p className={styles.noteContent}>{note.content}</p>
                      <div className={styles.noteFooter}>
                        <span className={styles.noteDate}>
                          {new Date(note.timestamp).toLocaleDateString()}
                        </span>
                        {note.basedOn.predictedTasks.length > 0 && (
                          <span className={styles.basedOn}>
                            Based on: {note.basedOn.predictedTasks[0].substring(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>
                  No learning notes yet. Generate personalized educational content based on your
                  activity!
                </p>
                <button
                  className={styles.emptyStateButton}
                  onClick={handleGenerateNote}
                  disabled={generatingNote}
                >
                  {generatingNote ? 'Generating...' : 'Generate First Note'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Chart */}
        <div className={`${styles.widget} ${styles.chartWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>📊 Activity by Category</h3>
          </div>
          <div className={styles.chartContent}>
            {categoryEntries.length > 0 ? (
              categoryEntries.map(([category, count]) => (
                <div key={category} className={styles.chartItem}>
                  <div className={styles.chartLabel}>{formatCategoryName(category)}</div>
                  <div className={styles.chartBar}>
                    <div
                      className={styles.chartFill}
                      style={{
                        width: `${getProgressWidth(
                          count,
                          Math.max(...Object.values(categoryStats)),
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className={styles.chartValue}>{count}</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Complete some tasks to see your activity chart!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scores */}
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

        {/* Profile & Analysis */}
        <div className={`${styles.widget} ${styles.profileWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>👤 Profile & Insights</h3>
          </div>
          <div className={styles.profileContent}>
            <div className={styles.profileInfo}>
              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Name:</span>
                <span className={styles.fieldValue}>{userProfile.name || 'Not set'}</span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Profession:</span>
                <span className={styles.fieldValue}>{userProfile.profession || 'Not set'}</span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Current Mood:</span>
                <span className={styles.fieldValue}>
                  {userProfile.mood || latestContext.mood || 'Not specified'}
                </span>
              </div>
              <div className={styles.profileField}>
                <span className={styles.fieldLabel}>Work Style:</span>
                <span className={styles.fieldValue}>
                  {userProfile.workStyle || userAnalysis?.workStyle || 'Not analyzed'}
                </span>
              </div>
            </div>

            {userAnalysis && (
              <div className={styles.insights}>
                <h4>🧠 AI Insights</h4>
                <div className={styles.insightTags}>
                  {userAnalysis.patterns.slice(0, 3).map((pattern, index) => (
                    <span key={index} className={styles.insightTag}>
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.actionButton} onClick={() => navigate('/')}>
          🎯 Get Next Task
        </button>
        <button className={styles.actionButton} onClick={() => navigate('/chat')}>
          💬 Chat Assistant
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
