export const TASK_CATEGORIES = {
  WORK_PRODUCTIVITY: 'work-productivity',
  HEALTH_WELLNESS: 'health-wellness',
  LEARNING_GROWTH: 'learning-growth',
  RELATIONSHIPS_COMPASSION: 'relationships-compassion',
  MINDFULNESS_PRESENCE: 'mindfulness-presence',
  ORGANIZATION_RESPONSIBILITY: 'organization-responsibility',
  CREATIVITY_EXPRESSION: 'creativity-expression',
  REFLECTION_ACCEPTANCE: 'reflection-acceptance',
  PHYSICAL_ACTIVITY: 'physical-activity',
  COMMUNICATION: 'communication',
  PLANNING_GOALS: 'planning-goals',
  MAINTENANCE_CARE: 'maintenance-care',
} as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[keyof typeof TASK_CATEGORIES];

export const TASK_CATEGORY_LIST: TaskCategory[] = Object.values(TASK_CATEGORIES);

export const TASK_CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  [TASK_CATEGORIES.MINDFULNESS_PRESENCE]: ['meditat', 'breath', 'mindful', 'present'],
  [TASK_CATEGORIES.RELATIONSHIPS_COMPASSION]: ['help', 'kind', 'support', 'care'],
  [TASK_CATEGORIES.ORGANIZATION_RESPONSIBILITY]: ['clean', 'organiz', 'plan', 'schedule'],
  [TASK_CATEGORIES.HEALTH_WELLNESS]: ['exercise', 'walk', 'stretch', 'water', 'sleep'],
  [TASK_CATEGORIES.LEARNING_GROWTH]: ['learn', 'read', 'study', 'research'],
  [TASK_CATEGORIES.CREATIVITY_EXPRESSION]: ['write', 'create', 'draw', 'design'],
  [TASK_CATEGORIES.COMMUNICATION]: ['call', 'message', 'email', 'reach out'],
  [TASK_CATEGORIES.REFLECTION_ACCEPTANCE]: ['reflect', 'journal', 'accept', 'gratitude'],
  [TASK_CATEGORIES.PLANNING_GOALS]: ['goal', 'plan', 'strategy', 'priority'],
  [TASK_CATEGORIES.MAINTENANCE_CARE]: ['fix', 'maintain', 'update', 'backup'],
  [TASK_CATEGORIES.PHYSICAL_ACTIVITY]: ['move', 'activity', 'physical'],
  [TASK_CATEGORIES.WORK_PRODUCTIVITY]: [], // default category, no specific keywords
};

export const TASK_CATEGORY_DESCRIPTIONS: Record<TaskCategory, string> = {
  [TASK_CATEGORIES.WORK_PRODUCTIVITY]: 'Work and productivity tasks',
  [TASK_CATEGORIES.HEALTH_WELLNESS]: 'Health and wellness activities',
  [TASK_CATEGORIES.LEARNING_GROWTH]: 'Learning and personal growth',
  [TASK_CATEGORIES.RELATIONSHIPS_COMPASSION]: 'Relationships and compassion',
  [TASK_CATEGORIES.MINDFULNESS_PRESENCE]: 'Mindfulness and presence',
  [TASK_CATEGORIES.ORGANIZATION_RESPONSIBILITY]: 'Organization and responsibility',
  [TASK_CATEGORIES.CREATIVITY_EXPRESSION]: 'Creativity and expression',
  [TASK_CATEGORIES.REFLECTION_ACCEPTANCE]: 'Reflection and acceptance',
  [TASK_CATEGORIES.PHYSICAL_ACTIVITY]: 'Physical activity and movement',
  [TASK_CATEGORIES.COMMUNICATION]: 'Communication and outreach',
  [TASK_CATEGORIES.PLANNING_GOALS]: 'Planning and goal setting',
  [TASK_CATEGORIES.MAINTENANCE_CARE]: 'Maintenance and care tasks',
};
