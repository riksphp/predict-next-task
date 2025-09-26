import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

export default function CategoryChartWidget({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).slice(0, 6);
  const getProgressWidth = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };
  const max = Math.max(1, ...Object.values(data));
  const formatCategoryName = (category: string) =>
    category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div className={`${styles.widget} ${styles.chartWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>📊 Activity by Category</h3>
      </div>
      <div className={styles.chartContent}>
        {entries.length > 0 ? (
          entries.map(([category, count]) => (
            <div key={category} className={styles.chartItem}>
              <div className={styles.chartLabel}>{formatCategoryName(category)}</div>
              <div className={styles.chartBar}>
                <div
                  className={styles.chartFill}
                  style={{ width: `${getProgressWidth(count, max)}%` }}
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
  );
}
