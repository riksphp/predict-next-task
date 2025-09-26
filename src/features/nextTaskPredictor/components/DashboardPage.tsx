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
import { getAISettings, type AISettings } from '../data-layer/aiSettingsStorage';
import AgentTracesWidget from '../../agentTracesWidget/components/AgentTracesWidget';
import ScoreOverviewWidget from '../../scoreOverviewWidget/components/ScoreOverviewWidget';
import RecentScoresWidget from '../../recentScoresWidget/components/RecentScoresWidget';
import LearningNotesWidget from '../../learningNotesWidget/components/LearningNotesWidget';
import CategoryChartWidget from '../../categoryChartWidget/components/CategoryChartWidget';
import ProfileInsightsWidget from '../../profileInsightsWidget/components/ProfileInsightsWidget';
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
  const [aiSettings, setAISettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  // Traces moved to AgentTracesWidget

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [
        profile,
        context,
        analysis,
        predicted,
        completed,
        score,
        history,
        categories,
        notes,
        settings,
      ] = await Promise.all([
        getUserProfile(),
        getUserContext(),
        getUserAnalysis(),
        getPredictedTasks(),
        getCompletedTasks(),
        getUserScore(),
        getScoreHistory(),
        getRecentCategoriesCount(168), // Last 7 days
        getGeneratedNotes(),
        getAISettings(),
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
      setAISettings(settings);

      // Debug: Log loaded data
      console.log('📊 Dashboard data loaded:', {
        predictedTasksCount: predicted.length,
        completedTasksCount: completed.length,
        currentScore: score?.totalPoints || 0,
        currentLevel: score?.level || 1,
        historyEntriesCount: history.length,
        lastCompletedTask: completed[completed.length - 1] || 'none',
      });

      // Run data integrity check
      await checkDataIntegrity();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const [processingTasks, setProcessingTasks] = useState<Set<string>>(new Set());

  async function handleTodoComplete(todo: string, completed: boolean) {
    console.log('handleTodoComplete called:', {
      todo,
      completed,
      processingTasks: Array.from(processingTasks),
    });

    if (completed) {
      // Check if task is already being processed
      if (processingTasks.has(todo)) {
        console.log('Task already being processed, skipping:', todo);
        return;
      }

      // Check if task is already in completed tasks to prevent double completion
      if (completedTasks.includes(todo)) {
        console.log('Task already completed, skipping:', todo);
        return;
      }

      // Mark task as being processed
      setProcessingTasks((prev) => new Set([...prev, todo]));

      try {
        console.log('Starting task completion for:', todo);
        await completeTask(todo);
        console.log('Task completion finished for:', todo);

        // Remove from predicted tasks immediately for better UX
        setPredictedTasks((prev) => prev.filter((task) => task !== todo));

        // Refresh all data to get updated completed tasks and scores
        await loadDashboardData();
        console.log('Dashboard data reloaded after completing:', todo);
      } catch (error) {
        console.error('Error completing task:', error);
        // Optionally show user-friendly error message
      } finally {
        // Remove task from processing set
        setProcessingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(todo);
          return newSet;
        });
      }
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

  // Debug function to check for data integrity issues
  async function checkDataIntegrity() {
    console.log('🔍 Running data integrity check...');

    const [score, history, , completed] = await Promise.all([
      getUserScore(),
      getScoreHistory(),
      getPredictedTasks(),
      getCompletedTasks(),
    ]);

    // Check for duplicate entries in score history
    const taskCompletions = history.filter((entry) => entry.interactionType === 'task_completion');
    const taskNames = taskCompletions.map((entry) => entry.task);
    const uniqueTaskNames = [...new Set(taskNames)];

    console.log('🏆 Score integrity check:', {
      totalScore: score?.totalPoints || 0,
      recordedCompletedTasks: score?.completedTasks || 0,
      actualCompletedTasksInList: completed.length,
      scoreHistoryEntries: history.length,
      taskCompletionEntries: taskCompletions.length,
      uniqueCompletedTasks: uniqueTaskNames.length,
      hasDuplicateScoreEntries: taskCompletions.length !== uniqueTaskNames.length,
    });

    if (taskCompletions.length !== uniqueTaskNames.length) {
      console.warn('⚠️ DUPLICATE SCORE ENTRIES DETECTED!');
      const duplicates = taskNames.filter((task, index) => taskNames.indexOf(task) !== index);
      console.log('🔄 Duplicate tasks:', [...new Set(duplicates)]);
    }

    // Expose to global scope for manual testing
    (window as any).checkDataIntegrity = checkDataIntegrity;
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

  // helpers moved into widgets

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

  // Filter out any predicted tasks that are already completed (data consistency)
  const currentTodos = (predictedTasks || []).filter((task) => !completedTasks.includes(task));
  // derived lists handled within widgets
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
        {/* header actions removed */}
      </div>

      <div className={styles.dashboardGrid}>
        <ScoreOverviewWidget userScore={userScore} />

        {/* Predicted Tasks (Todos) */}
        <div className={`${styles.widget} ${styles.todoWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>📝 Predicted Tasks</h3>
            <span className={styles.badge}>{currentTodos.length}</span>
          </div>
          <div className={styles.todoList}>
            {currentTodos.length > 0 ? (
              currentTodos.map((todo, index) => (
                <div key={`todo-${todo}-${index}`} className={styles.todoItem}>
                  <label className={styles.todoCheckbox}>
                    <input
                      type="checkbox"
                      disabled={processingTasks.has(todo)}
                      onChange={(e) => handleTodoComplete(todo, e.target.checked)}
                    />
                    <span className={styles.checkmark}></span>
                  </label>
                  <span className={styles.todoText}>
                    {todo}
                    {processingTasks.has(todo) && (
                      <span className={styles.processingIndicator}> ⏳</span>
                    )}
                  </span>
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

        <LearningNotesWidget
          notes={generatedNotes}
          generating={generatingNote}
          onGenerate={handleGenerateNote}
        />

        <CategoryChartWidget data={categoryStats} />

        <RecentScoresWidget entries={scoreHistory} />

        {/* AI Configuration Status */}
        <div className={`${styles.widget} ${styles.aiConfigWidget}`}>
          <div className={styles.widgetHeader}>
            <h3>🤖 AI Configuration</h3>
            <div className={styles.headerActions}>
              <button className={styles.configureButton} onClick={() => navigate('/ai-settings')}>
                ⚙️ Configure
              </button>
            </div>
          </div>
          <div className={styles.aiConfigContent}>
            {aiSettings ? (
              <>
                <div className={styles.configField}>
                  <span className={styles.fieldLabel}>Provider:</span>
                  <span className={`${styles.fieldValue} ${styles.providerTag}`}>
                    {aiSettings.provider === 'gemini'
                      ? '🟢 Google Gemini'
                      : aiSettings.provider === 'openai'
                      ? '🔵 OpenAI'
                      : aiSettings.provider === 'groq'
                      ? '🟠 Groq'
                      : '⚪ Custom API'}
                  </span>
                </div>
                <div className={styles.configField}>
                  <span className={styles.fieldLabel}>Model:</span>
                  <span className={styles.fieldValue}>{aiSettings.modelName || 'Default'}</span>
                </div>
                <div className={styles.configField}>
                  <span className={styles.fieldLabel}>Status:</span>
                  <span
                    className={`${styles.fieldValue} ${styles.statusTag} ${
                      aiSettings.apiKey ? styles.configured : styles.notConfigured
                    }`}
                  >
                    {aiSettings.apiKey ? '✅ Configured' : '⚠️ API Key Missing'}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>Configure your AI settings to enable personalized task prediction.</p>
                <button
                  className={styles.emptyStateButton}
                  onClick={() => navigate('/ai-settings')}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Agent Traces (accordion) */}
        <AgentTracesWidget />

        <ProfileInsightsWidget
          profile={userProfile}
          latestMood={latestContext.mood}
          insights={userAnalysis?.patterns}
        />
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
