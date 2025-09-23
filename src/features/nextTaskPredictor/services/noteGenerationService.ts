import { callGeminiApi } from '../data-layer/geminiApi';
import { getPredictedTasks, getCompletedTasks } from '../data-layer/taskStorage';
import { getUserProfile } from '../data-layer/userProfileStorage';
import { getOrCreateDefaultThread, getMessages } from '../data-layer/conversationStorage';
import { getRecentCategoriesCount } from '../data-layer/taskCategoryStorage';
import {
  getGeneratedNotes,
  saveGeneratedNote,
  generateNoteId,
  type GeneratedNote,
} from '../data-layer/notesStorage';

interface NoteGenerationResult {
  title: string;
  content: string;
  category: string;
}

export async function generateEducationalNote(): Promise<GeneratedNote> {
  // Gather user context
  const predictedTasks = await getPredictedTasks();
  const completedTasks = await getCompletedTasks();
  const profile = await getUserProfile();
  const thread = await getOrCreateDefaultThread();
  const recentMessages = (await getMessages(thread.id))
    .slice(-10)
    .map((m) => ({ role: m.role, text: m.text }));
  const recentCategories = await getRecentCategoriesCount(48);

  // Get existing notes to avoid repetition
  const existingNotes = await getGeneratedNotes();
  const existingTitles = existingNotes.map((note: GeneratedNote) => note.title.toLowerCase());
  const existingCategories = existingNotes.map((note: GeneratedNote) => note.category);

  // Avoid generating similar topics
  const recentNoteTopics = existingNotes
    .slice(0, 5)
    .map((note: GeneratedNote) =>
      note.title
        .toLowerCase()
        .split(' ')
        .filter((word: string) => word.length > 3),
    )
    .flat();

  // Extract conversation topics
  const conversationTopics = recentMessages
    .map((m) => m.text)
    .join(' ')
    .toLowerCase()
    .split(' ')
    .filter((word) => word.length > 4)
    .slice(0, 20);

  const context = {
    predictedTasks: predictedTasks.slice(0, 5),
    completedTasks: completedTasks.slice(-5),
    profile,
    conversationTopics: [...new Set(conversationTopics)], // Remove duplicates
    recentCategories: Object.keys(recentCategories),
    totalTasksCompleted: completedTasks.length,
    currentFocusArea: determineFocusArea(predictedTasks, completedTasks, recentCategories),
    // Repetition prevention
    existingTitles,
    existingCategories,
    recentNoteTopics,
    totalExistingNotes: existingNotes.length,
  };

  const prompt = createNoteGenerationPrompt(context);
  const response = await callGeminiApi(prompt);

  let noteData: NoteGenerationResult;
  try {
    const trimmed = response
      .trim()
      .replace(/```json|```/g, '')
      .trim();
    noteData = JSON.parse(trimmed) as NoteGenerationResult;
  } catch {
    // Fallback parsing if JSON fails
    const lines = response.split('\n').filter((line) => line.trim());
    noteData = {
      title: lines[0] || 'Personal Development Insight',
      content: lines.slice(1).join('\n') || response,
      category: 'general',
    };
  }

  // Create the note object
  const note: GeneratedNote = {
    id: generateNoteId(),
    title: noteData.title,
    content: noteData.content,
    category: noteData.category,
    timestamp: new Date().toISOString(),
    basedOn: {
      predictedTasks: predictedTasks.slice(0, 3),
      completedTasks: completedTasks.slice(-3),
      conversationTopics: conversationTopics.slice(0, 5),
    },
  };

  // Save the note
  await saveGeneratedNote(note);

  return note;
}

function determineFocusArea(
  predictedTasks: string[],
  completedTasks: string[],
  recentCategories: Record<string, number>,
): string {
  const allTasks = [...predictedTasks, ...completedTasks];
  const taskText = allTasks.join(' ').toLowerCase();

  if (
    taskText.includes('work') ||
    taskText.includes('career') ||
    taskText.includes('professional')
  ) {
    return 'professional_growth';
  }
  if (
    taskText.includes('health') ||
    taskText.includes('exercise') ||
    taskText.includes('wellness')
  ) {
    return 'health_wellness';
  }
  if (taskText.includes('creative') || taskText.includes('art') || taskText.includes('design')) {
    return 'creativity';
  }
  if (taskText.includes('learn') || taskText.includes('study') || taskText.includes('skill')) {
    return 'learning';
  }
  if (
    taskText.includes('mindful') ||
    taskText.includes('meditation') ||
    taskText.includes('reflection')
  ) {
    return 'mindfulness';
  }

  // Default based on most common category
  const topCategory = Object.keys(recentCategories)[0];
  if (topCategory) {
    if (topCategory.includes('work') || topCategory.includes('productivity'))
      return 'professional_growth';
    if (topCategory.includes('health') || topCategory.includes('wellness'))
      return 'health_wellness';
    if (topCategory.includes('creative')) return 'creativity';
    if (topCategory.includes('learning')) return 'learning';
    if (topCategory.includes('mindfulness')) return 'mindfulness';
  }

  return 'personal_development';
}

function createNoteGenerationPrompt(context: any): string {
  const profession = context.profile.profession || 'Professional';
  const isSecurityArch =
    profession.toLowerCase().includes('security') || profession.toLowerCase().includes('architect');

  return `You are creating diverse, technical educational content for a ${profession}.

CRITICAL ANTI-REPETITION RULES:
- NEVER use these existing titles: ${context.existingTitles.join(', ')}
- AVOID these overused words: ${context.recentNoteTopics.join(', ')}
- Current notes count: ${context.totalExistingNotes}

DIVERSITY REQUIREMENTS:
Generate content that is COMPLETELY different from previous notes. Focus on:

TECHNICAL DEPTH CATEGORIES:
1. SYSTEM ARCHITECTURE: Microservices, distributed systems, scalability patterns, API design
2. SECURITY DEEP-DIVE: Zero-trust architecture, threat modeling, secure coding practices, cryptography
3. DEVELOPMENT METHODOLOGIES: DevOps practices, CI/CD pipelines, infrastructure as code
4. DATA & ANALYTICS: Data pipelines, machine learning operations, real-time processing
5. EMERGING TECH: Cloud-native technologies, serverless computing, edge computing
6. PROBLEM-SOLVING: Debugging methodologies, performance optimization, incident response
7. SOFT SKILLS: Technical leadership, stakeholder management, system thinking

USER CONTEXT:
- Profession: ${profession}
- Recent Activities: ${context.predictedTasks.concat(context.completedTasks).join(', ')}
- Conversation Topics: ${context.conversationTopics.join(', ')}
- Focus Area: ${context.currentFocusArea}

${
  isSecurityArch
    ? `
SECURITY ARCHITECT SPECIALIZATION:
- Advanced threat detection strategies
- Security architecture patterns (SASE, ZTM, SOAR)
- Risk assessment frameworks (NIST, ISO 27001)
- Security automation and orchestration
- Cloud security posture management
- Identity and access management architectures
`
    : ''
}

CONTENT REQUIREMENTS:
1. Must be technical and actionable
2. Include specific tools, frameworks, or methodologies
3. Provide step-by-step guidance or implementation tips
4. Reference industry standards or best practices
5. Include practical examples or use cases
6. Be 200-300 words with technical depth

TONE: Professional but engaging, avoid buzzwords, focus on practical application.

Return ONLY valid JSON:
{
  "title": "Specific technical title (no generic words like 'effective', 'mastering', 'art of')",
  "content": "Detailed technical content with actionable insights, specific tools, and implementation guidance",
  "category": "technical_knowledge"
}`;
}

export async function generateNoteBasedOnUserRequest(userRequest: string): Promise<GeneratedNote> {
  const profile = await getUserProfile();
  const existingNotes = await getGeneratedNotes();
  const existingTitles = existingNotes.map((note: GeneratedNote) => note.title.toLowerCase());

  const prompt = `Generate a technical educational note based on user's specific request: "${userRequest}"

User Profile: ${profile.profession || 'Professional'}
Existing Notes to Avoid: ${existingTitles.join(', ')}

Requirements:
1. Must be directly related to the user's request
2. Provide deep technical insights and actionable guidance
3. Include specific tools, frameworks, methodologies, or code examples
4. Be 250-400 words with technical depth
5. Avoid generic titles and content
6. Focus on practical implementation

Return ONLY valid JSON:
{
  "title": "Specific technical title related to user request",
  "content": "Detailed technical content with actionable insights, specific tools, and implementation guidance",
  "category": "user_requested"
}`;

  const response = await callGeminiApi(prompt);

  let noteData: NoteGenerationResult;
  try {
    const trimmed = response
      .trim()
      .replace(/```json|```/g, '')
      .trim();
    noteData = JSON.parse(trimmed) as NoteGenerationResult;
  } catch {
    noteData = {
      title: `Technical Guide: ${userRequest.substring(0, 50)}`,
      content: response,
      category: 'user_requested',
    };
  }

  const note: GeneratedNote = {
    id: generateNoteId(),
    title: noteData.title,
    content: noteData.content,
    category: noteData.category,
    timestamp: new Date().toISOString(),
    basedOn: {
      predictedTasks: [],
      completedTasks: [],
      conversationTopics: [userRequest],
    },
  };

  await saveGeneratedNote(note);
  return note;
}

export async function generateNoteBasedOnCategory(category: string): Promise<GeneratedNote> {
  const prompt = `Generate a technical educational note about ${category}.

Focus on advanced, specific technical concepts with practical implementation details.

Return ONLY valid JSON:
{
  "title": "Specific technical title about ${category}",
  "content": "Detailed technical content (200-300 words) with actionable insights, specific tools, and implementation guidance",
  "category": "${category}"
}`;

  const response = await callGeminiApi(prompt);

  let noteData: NoteGenerationResult;
  try {
    const trimmed = response
      .trim()
      .replace(/```json|```/g, '')
      .trim();
    noteData = JSON.parse(trimmed) as NoteGenerationResult;
  } catch {
    noteData = {
      title: `Technical ${category.replace('_', ' ')} Guide`,
      content: response,
      category,
    };
  }

  const note: GeneratedNote = {
    id: generateNoteId(),
    title: noteData.title,
    content: noteData.content,
    category: noteData.category,
    timestamp: new Date().toISOString(),
    basedOn: {
      predictedTasks: [],
      completedTasks: [],
      conversationTopics: [category],
    },
  };

  await saveGeneratedNote(note);
  return note;
}
