import { TASK_CATEGORIES } from './taskCategories';

export interface InteractiveTaskTemplate {
  category: string;
  taskFormat: string;
  interactionType: 'conversation' | 'challenge' | 'quiz' | 'reflection';
  scoringCriteria: string[];
  maxPoints: number;
}

export const INTERACTIVE_TASK_TEMPLATES: InteractiveTaskTemplate[] = [
  // Mindfulness & Presence
  {
    category: TASK_CATEGORIES.MINDFULNESS_PRESENCE,
    taskFormat:
      'Practice a 5-minute mindfulness exercise with me. I will guide you through breathing techniques and ask questions about your experience.',
    interactionType: 'conversation',
    scoringCriteria: ['Engagement with prompts', 'Mindful responses', 'Completion of exercise'],
    maxPoints: 10,
  },
  {
    category: TASK_CATEGORIES.MINDFULNESS_PRESENCE,
    taskFormat:
      'Answer 3 reflection questions about present moment awareness. I will evaluate the depth of your responses.',
    interactionType: 'reflection',
    scoringCriteria: ['Thoughtful answers', 'Self-awareness', 'Authenticity'],
    maxPoints: 8,
  },

  // Learning & Growth
  {
    category: TASK_CATEGORIES.LEARNING_GROWTH,
    taskFormat:
      'Take a quick knowledge quiz on a topic of your choice. I will ask 3-5 questions and provide immediate feedback.',
    interactionType: 'quiz',
    scoringCriteria: ['Correct answers', 'Learning engagement', 'Follow-up questions'],
    maxPoints: 12,
  },
  {
    category: TASK_CATEGORIES.LEARNING_GROWTH,
    taskFormat:
      'Teach me something you learned recently in 2-3 minutes. I will ask clarifying questions and evaluate your explanation.',
    interactionType: 'challenge',
    scoringCriteria: ['Clear explanation', 'Handling questions', 'Knowledge demonstration'],
    maxPoints: 10,
  },

  // Creativity & Expression
  {
    category: TASK_CATEGORIES.CREATIVITY_EXPRESSION,
    taskFormat:
      'Create a short story or poem based on a prompt I give you. I will provide feedback and score your creativity.',
    interactionType: 'challenge',
    scoringCriteria: ['Creativity', 'Following prompt', 'Completion'],
    maxPoints: 15,
  },
  {
    category: TASK_CATEGORIES.CREATIVITY_EXPRESSION,
    taskFormat:
      'Brainstorm 5 creative solutions to a problem I present. I will evaluate the originality and feasibility.',
    interactionType: 'challenge',
    scoringCriteria: ['Original ideas', 'Practical solutions', 'Full completion'],
    maxPoints: 12,
  },

  // Relationships & Compassion
  {
    category: TASK_CATEGORIES.RELATIONSHIPS_COMPASSION,
    taskFormat:
      'Practice empathy by responding to 3 scenarios I present. I will evaluate your compassionate responses.',
    interactionType: 'conversation',
    scoringCriteria: ['Empathetic responses', 'Understanding shown', 'Thoughtful advice'],
    maxPoints: 10,
  },

  // Reflection & Acceptance
  {
    category: TASK_CATEGORIES.REFLECTION_ACCEPTANCE,
    taskFormat:
      'Reflect on a recent challenge and share 3 lessons learned. I will guide you through deeper reflection.',
    interactionType: 'reflection',
    scoringCriteria: ['Honest reflection', 'Insight depth', 'Growth mindset'],
    maxPoints: 10,
  },

  // Communication
  {
    category: TASK_CATEGORIES.COMMUNICATION,
    taskFormat:
      'Practice explaining a complex concept in simple terms. I will play the role of someone unfamiliar with the topic.',
    interactionType: 'challenge',
    scoringCriteria: ['Clarity', 'Simplification', 'Engagement'],
    maxPoints: 12,
  },

  // Planning & Goals
  {
    category: TASK_CATEGORIES.PLANNING_GOALS,
    taskFormat:
      'Create a SMART goal with me and break it into actionable steps. I will evaluate the quality of your planning.',
    interactionType: 'conversation',
    scoringCriteria: ['SMART criteria met', 'Actionable steps', 'Realistic timeline'],
    maxPoints: 15,
  },

  // Health & Wellness
  {
    category: TASK_CATEGORIES.HEALTH_WELLNESS,
    taskFormat:
      'Design a 10-minute wellness routine and explain why each element benefits you. I will evaluate your health knowledge.',
    interactionType: 'challenge',
    scoringCriteria: ['Health knowledge', 'Personal relevance', 'Practical design'],
    maxPoints: 10,
  },

  // Organization & Responsibility
  {
    category: TASK_CATEGORIES.ORGANIZATION_RESPONSIBILITY,
    taskFormat:
      'Prioritize 5 tasks I give you using a framework of your choice. Explain your reasoning.',
    interactionType: 'challenge',
    scoringCriteria: ['Logical prioritization', 'Framework usage', 'Clear reasoning'],
    maxPoints: 12,
  },
];

export function getRandomInteractiveTask(
  excludeCategories: string[] = [],
): InteractiveTaskTemplate {
  const availableTasks = INTERACTIVE_TASK_TEMPLATES.filter(
    (task) => !excludeCategories.includes(task.category),
  );

  if (availableTasks.length === 0) {
    // If all categories are excluded, return a random task anyway
    return INTERACTIVE_TASK_TEMPLATES[
      Math.floor(Math.random() * INTERACTIVE_TASK_TEMPLATES.length)
    ];
  }

  return availableTasks[Math.floor(Math.random() * availableTasks.length)];
}
