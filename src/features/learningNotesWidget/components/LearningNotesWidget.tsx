import { useState } from 'react';
import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: number | string;
  basedOn: { predictedTasks: string[] };
};

export default function LearningNotesWidget({
  notes,
  generating,
  onGenerate,
}: {
  notes: Note[];
  generating: boolean;
  onGenerate: () => void;
}) {
  const displayed = notes.slice(0, 5);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return (
    <div className={`${styles.widget} ${styles.notesWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>📚 Learning Notes</h3>
        <div className={styles.headerActions}>
          <span className={styles.badge}>{notes.length}</span>
          <button className={styles.generateButton} onClick={onGenerate} disabled={generating}>
            {generating ? '⏳' : '✨'} Generate Note
          </button>
        </div>
      </div>
      <div className={styles.notesList}>
        {displayed.length > 0 ? (
          displayed.map((note) => {
            const isOpen = expanded.has(note.id);
            return (
              <div key={note.id} className={styles.accordionItem}>
                <div className={styles.accordionHeader} onClick={() => toggle(note.id)}>
                  <div className={styles.accordionTitle}>
                    <span className={styles.noteIcon}>📖</span>
                    <span className={styles.noteTitleText}>{note.title}</span>
                  </div>
                  <div className={styles.accordionMeta}>
                    <span className={styles.noteCategory}>{note.category.replace('_', ' ')}</span>
                    <span className={styles.accordionToggle}>{isOpen ? '−' : '+'}</span>
                  </div>
                </div>
                {isOpen && (
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
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <p>
              No learning notes yet. Generate personalized educational content based on your
              activity!
            </p>
            <button className={styles.emptyStateButton} onClick={onGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate First Note'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
