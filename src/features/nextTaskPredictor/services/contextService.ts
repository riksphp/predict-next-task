import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi, callCustomAI } from '../data-layer/geminiApi';
import { getAISettings } from '../data-layer/aiSettingsStorage';
import { addNewContext, ContextData, getUserContext } from '../data-layer/userContextStorage';
import { getBaseTruths } from '../data-layer/baseTruths';
import { getUserAnalysis } from './analysisService';
import { ConversationMessage, addMessage, getMessages } from '../data-layer/conversationStorage';
import { getUserProfile, updateUserProfile, UserProfile } from '../data-layer/userProfileStorage';

export interface ExtractedContextResult {
  serverResponse: string;
  profile: UserProfile;
  lastMessages: ConversationMessage[];
  userContext: Record<string, ContextData>;
}

export async function extractContext(
  input: string,
  threadId?: string,
): Promise<ExtractedContextResult> {
  const baseTruths = getBaseTruths();

  // Get or create user analysis for better context
  let userAnalysis = await getUserAnalysis();
  // if (!userAnalysis) {
  // userAnalysis = await analyzeUserInputs();
  // }

  const profile = await getUserProfile();
  const recentMessages = threadId ? await getMessages(threadId) : [];

  const enrichedContext = {
    input,
    userAnalysis,
    profile,
    recentMessages: recentMessages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
  };

  const prompt = PROMPTS.TEMPLATES.CONTEXT_EXTRACTION({
    baseTruths,
    userInput: enrichedContext,
  });

  // Use the appropriate AI service based on user settings
  const settings = await getAISettings();
  const response =
    settings.provider === 'gemini' ? await callGeminiApi(prompt) : await callCustomAI(prompt);

  let serverResponse = 'Thanks for sharing!';
  let parsed: ContextData | null = null;
  try {
    let jsonString = response.trim();
    jsonString = jsonString.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(jsonString) as ContextData;
  } catch (error) {
    console.error('Failed to parse context:', error);
    parsed = { serverResponse: response } as ContextData;
  }

  const newContext: ContextData = parsed || {};
  serverResponse = newContext.serverResponse || serverResponse;
  const { serverResponse: _omit, ...contextToSave } = newContext;

  // Persist user context snapshot
  await addNewContext(contextToSave);

  // Persist profile subset
  const profilePatch: UserProfile = {
    name: newContext.name,
    profession: newContext.profession,
    mood: newContext.mood,
    goals: newContext.goals,
    preferences: newContext.preferences,
    interests: newContext.interests,
    priorities: newContext.priorities,
    workStyle: newContext.workStyle,
    character: newContext.character,
  };
  const updatedProfile = await updateUserProfile(profilePatch);

  // Persist assistant message into conversation
  if (threadId && serverResponse) {
    await addMessage(threadId, 'assistant', serverResponse);
  }

  const userContext = await getUserContext();
  const lastMessages = threadId ? await getMessages(threadId) : [];

  return {
    serverResponse,
    profile: updatedProfile,
    lastMessages,
    userContext,
  };
}
