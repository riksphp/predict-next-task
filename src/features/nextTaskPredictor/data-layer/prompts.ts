import { BASE_TRUTHS } from './baseTruths';

export const APP_HELP_CONTEXT = {
  description:
    'This app collects user input such as todos, reminders, mood, and ideas, and predicts the next meaningful task for the user using an AI assistant.',
  instructions:
    'Users talk naturally, list tasks, share ideas, and the AI suggests the next SMART action.',
  taskPredictionContext: `Use the following base truths to predict the next meaningful task: ${JSON.stringify(
    BASE_TRUTHS,
  )}. If no user-specific context is present, predict based on base truths alone.`,
};

export const PROMPTS = {
  INPUT_PLACEHOLDER: 'Type anything... todos, ideas, thoughts',
  INPUT_LABEL:
    "Tell me about your name, mood, todos, recent activity, or any ideas — I'll use this to suggest the best next task for you.",
  CHAT_PLACEHOLDER: 'Type your message...',
  ASSISTANT_PLACEHOLDER: "I'm here to help! This is a placeholder response.",
  // Legacy string prompts (kept for backwards compatibility)
  TASK_PREDICTION: `You are a personal assistant grounded in the base truths.\n\nAlways suggest the next meaningful task for the user, even if no user context is provided. \nEach task must be a SMART action (Specific, Measurable, Achievable, Relevant, Time-bound). \nKeep answers short, practical, and actionable.\n\nCRITICAL RULES:\n- NEVER suggest tasks from the completedTasks array - these are already done\n- NEVER suggest tasks from the predictedTasks array - these are already suggested\n- Always suggest something NEW and different from previous suggestions\n- Focus on fresh, actionable next steps\n- The task should be achievable in half an hour. IST format preferred\n- Every 3rd suggestion should be a task from the Base Truths \n\n\nBase Truths: {baseTruths}\nUser Context: {context}\n\nRespond ONLY with:\n1. The next meaningful task (one sentence, SMART format.)\n2. A short reasoning (one line, practical, not philosophical)`,
  CONTEXT_EXTRACTION: `You are a friendly personal assistant grounded in the base truths.\n\nYour main function - ${JSON.stringify(
    APP_HELP_CONTEXT,
  )}\n\nYour tasks:\n1. Extract structured user context from the input.\n2. Keep track of the conversation in a "serverResponse" field — this is what will be shown in the UI.\n3. Always try to ask the user a question to collect more information for context.\n\nFields to extract from user input:\n- name: user's name if mentioned, otherwise null\n- profession: user's job/role if mentioned, otherwise null\n- mood: emotional state if mentioned, otherwise null\n- todos: array of tasks or pending items mentioned\n- quickNotes: array of ideas, thoughts, or random notes\n- preferences: any user preferences like work hours, habits; null if not present\n- serverResponse: short assistant message asking the next question or engaging the user\n\nRules:\n- Try to infer missing information from user input if possible.\n- Keep the serverResponse friendly, actionable, and always inviting user input.\n- Respond ONLY in valid JSON with the fields above.\n- Do not add extra explanation or commentary outside JSON.\n- patterns: array of behavioral patterns observed\n- interests: array of topics/areas user is interested in\n- workStyle: string describing how user approaches tasks\n- priorities: array of what seems most important to user\n- suggestions: array of productivity suggestions based on patterns\n- If completedTodo is present then remove that task from todo in json response.\n\nUse this base truth to guide reasoning:\n\nBase Truths: {baseTruths}\n\nExample:\n\nUser input: "I am Rishikesh, a Security Architect. I feel tired. I want to finish slides and send report."\nJSON response:\n{\n  "name": "Rishikesh",\n  "profession": "Security Architect",\n  "mood": "tired",\n  "todos": ["finish slides", "send report"],\n  "quickNotes": [],\n  "preferences": null,\n  "serverResponse": "Thanks! Can you tell me what you plan to work on next or any ideas you have?"\n}\n\nNow process the user input:\n"{userInput}"`,
  USER_INPUT_ANALYSIS: `You are an AI assistant analyzing user input patterns to create insights.\n\nAnalyze all user inputs and return JSON with:\n- patterns: array of behavioral patterns observed\n- interests: array of topics/areas user is interested in\n- workStyle: string describing how user approaches tasks\n- priorities: array of what seems most important to user\n- suggestions: array of productivity suggestions based on patterns\n\nUser Inputs: {userInputs}\n\nRespond ONLY with valid JSON.`,
  // Modular templates
  TEMPLATES: {
    CONTEXT_EXTRACTION: ({ baseTruths, userInput }: { baseTruths: unknown; userInput: unknown }) =>
      `You are a concise, friendly personal assistant grounded in base truths.\n\n- Extract structured user profile and state from the latest message.\n- Reply with serverResponse that continues the conversation and asks a focused question.\n- Output ONLY valid JSON. No markdown.\n\nRequired JSON fields:\n- name, profession, mood (strings or null)\n- todos, quickNotes, interests, priorities, goals (arrays, default [])\n- preferences (object, default {})\n- workStyle, character (strings or null)\n- serverResponse (short, 1-2 sentences, ask a question)\n\nBaseTruths: ${JSON.stringify(
        baseTruths,
      )}\nRecentContext: ${JSON.stringify(userInput)}\n`,
    TASK_PREDICTION: ({ context }: { context: unknown }) => {
      const ctx = context as any;
      const hasManySimilarTasks = ctx.shouldAvoidSimilarTasks;
      const hasUncompletedTasks = ctx.pendingTasksCount > 0 && ctx.completedTasksCount === 0;

      return `You are a personal assistant suggesting interactive tasks.\n\nGoal: Propose ONE CONCISE interactive task (30 mins max) that engages the user with AI.\n\nCRITICAL REPETITION PREVENTION:\n${
        hasUncompletedTasks
          ? '⚠️ USER HAS UNCOMPLETED TASKS - MUST SUGGEST COMPLETELY DIFFERENT CATEGORY/TOPIC!'
          : ''
      }\n${
        hasManySimilarTasks ? '⚠️ TOO MANY SIMILAR PENDING TASKS - FORCE VARIETY!' : ''
      }\n- NEVER suggest anything similar to items in allPreviousTasks\n- NEVER use same keywords, topics, or themes from predictedTasks\n- If user has ${
        ctx.pendingTasksCount
      } pending tasks, suggest COMPLETELY different topic\n- Analyze completed vs predicted ratio - if imbalanced, change approach entirely\n\nPRIORITY ORDER (choose highest available priority):\n1. USER INPUT PRIORITY: If user has specific todos, goals, or recent messages, create tasks directly related to those\n2. PROFESSIONAL GROWTH: Tasks related to career, skills, learning, work productivity, communication\n3. PERSONAL GROWTH: Tasks for health, creativity, relationships, organization, planning\n4. FOUNDATIONAL: Tasks for mindfulness, reflection, acceptance, responsibility, compassion\n\nVARIETY ENFORCEMENT:\n- If pendingTasksCount > 0 and completedTasksCount = 0: FORCE different category entirely\n- If shouldForceNewCategory = true: Pick category NOT in recentCategories\n- If shouldAvoidSimilarTasks = true: Avoid all topics/keywords from predictedTasks\n- Rotate between: work/learning → health/physical → creative/social → mindfulness\n\nConstraints:\n- Must be COMPLETELY NEW: different from ALL items in allPreviousTasks\n- Must be DIFFERENT CATEGORY: avoid ALL recent categories if flagged\n- Must be INTERACTIVE: conversation, challenge, quiz, or reflection\n- Start with action verb, be specific and brief\n- Include scoring (5-15 points)\n- If user ignoring tasks, change topic completely\n\nReturn ONLY valid JSON:\n{\n  "task": string,           // ONE concise sentence starting with verb - TOTALLY different from previous\n  "why": string,            // 1-2 sentence benefit explanation\n  "category": string,       // MUST be different if shouldForceNewCategory=true\n  "interactionType": string,\n  "durationMinutes": number,\n  "deadlineIST": string,    // 'HH:mm IST today'\n  "maxPoints": number,\n  "scoringCriteria": string[]\n}\n\nContext: ${JSON.stringify(
        context,
      )}`;
    },
    USER_INPUT_ANALYSIS: ({ userInputs }: { userInputs: string }) =>
      `You are analyzing user input history for patterns.\n\nReturn ONLY valid JSON with keys: patterns, interests, workStyle, priorities, suggestions.\n\nUser Inputs:\n${userInputs}`,
    NOTE_REQUEST_DETECTION: ({ userMessage }: { userMessage: string }) =>
      `Analyze this user message to determine if they want a technical note generated.

User Message: "${userMessage}"

Look for phrases like:
- "generate note about..."
- "create note on..."
- "make note about..."
- "note on..." 
- "explain..." (for technical topics)
- "how to..." (for technical processes)
- "guide on..."
- "tell me about..." (for technical concepts)

Return ONLY valid JSON:
{
  "wantsNote": boolean,
  "topic": "specific topic they want a note about (or null if not requesting)",
  "technical": boolean
}`,
  },
};
