import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROMPTS } from '../data-layer/prompts';
// import { extractContext } from '../services/contextService';
import { saveUserInput } from '../data-layer/userInputStorage';
import {
  getOrCreateDefaultThread,
  setCurrentThreadId,
  getMessages,
  addMessage,
  getThreadSummary,
  setThreadSummary,
} from '../data-layer/conversationStorage';
import styles from './ChatPage.module.css';
import { clearThreadMessages } from '../data-layer/conversationStorage';
import { summarizeConversation } from '../services/simpleChatSummarizer';
import { simpleChatOrchestrator } from '../../../agent';
import { getUserProfile } from '../data-layer/userProfileStorage';
import { getAgentInsights } from '../data-layer/agentInsightsStorage';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface TaskContext {
  task: string;
  reasoning: string;
  userInput: string;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [taskContext, setTaskContext] = useState<TaskContext | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevInitialMessageRef = useRef<string | null>(null);
  const priorSummaryRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      // Use existing thread if present; otherwise create a default one
      const thread = await getOrCreateDefaultThread();
      await setCurrentThreadId(thread.id);
      setThreadId(thread.id);
      const persisted = await getMessages(thread.id);
      setMessages(
        persisted.map((m) => ({
          id: Date.parse(m.timestamp),
          text: m.text,
          isUser: m.role === 'user',
        })),
      );
      // Load prior summary if exists
      const prevSummary = await getThreadSummary(thread.id);
      priorSummaryRef.current = prevSummary;
      const taskCtx = location.state?.taskContext;
      if (taskCtx) setTaskContext(taskCtx);
      // Preload profile and insights for context-aware replies
      const [profile, insights] = await Promise.all([getUserProfile(), getAgentInsights()]);
      setTaskContext({
        task: taskCtx?.task || 'General Chat',
        reasoning: JSON.stringify({ profile, insights }),
        userInput: '',
      });
      const initialMessage = location.state?.initialMessage;
      if (initialMessage && prevInitialMessageRef.current !== initialMessage) {
        prevInitialMessageRef.current = initialMessage;
        await handleSend(initialMessage);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = async (textToSend?: string): Promise<void> => {
    const messageText = textToSend || message;
    if (messageText.trim()) {
      // Save user input
      await saveUserInput(messageText.trim(), 'chat');
      if (threadId) {
        await addMessage(threadId, 'user', messageText.trim());
      }

      const userMessage: Message = {
        id: Date.now(),
        text: messageText.trim(),
        isUser: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!textToSend) setMessage('');

      // Simple assistant with base truths + conversation context and rolling summary
      try {
        const recent = threadId ? await getMessages(threadId) : [];
        const convo = recent.map((m) => ({ role: m.role, text: m.text, timestamp: m.timestamp }));
        const [profile, insights] = await Promise.all([getUserProfile(), getAgentInsights()]);
        const agentOutput = await simpleChatOrchestrator.execute({
          userId: 'default-user',
          sessionId: threadId || 'thread',
          goal: messageText.trim(),
          context: {
            threadId,
            taskContext,
            profile,
            insights,
            conversation: convo,
            priorSummary: priorSummaryRef.current || undefined,
          },
        });
        const replyText = (agentOutput as any).content?.message
          ? String((agentOutput as any).content.message)
          : typeof agentOutput.content === 'string'
          ? (agentOutput.content as string)
          : JSON.stringify(agentOutput.content ?? agentOutput);
        if (threadId) await addMessage(threadId, 'assistant', replyText);
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: replyText,
          isUser: false,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // After 500+ total messages, summarize and clear older ones
        const allNow = threadId ? await getMessages(threadId) : [];
        if (allNow.length > 500 && threadId) {
          const summary = await summarizeConversation(
            allNow.map((m) => ({ role: m.role, text: m.text })),
          );
          priorSummaryRef.current = summary;
          await setThreadSummary(threadId, summary);
          await clearThreadMessages(threadId);
          // Seed the thread with a system summary message for continuity
          await addMessage(threadId, 'system', `Summary: ${summary}`);
          setMessages([{ id: Date.now() + 2, text: `Summary: ${summary}`, isUser: false }]);
        }
      } catch (e) {
        const errText = e instanceof Error ? e.message : 'Agent error';
        if (threadId) await addMessage(threadId, 'assistant', `Error: ${errText}`);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: `Error: ${errText}`, isUser: false },
        ]);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            ←
          </button>
          <span className={styles.chatTitle}>
            {taskContext ? `Working on Task` : 'Chat with Assistant'}
          </span>
        </div>

        {taskContext && (
          <div className={styles.taskBanner}>
            <div className={styles.taskTitle}>🎯 Current Task:</div>
            <div className={styles.taskText}>{taskContext.task}</div>
          </div>
        )}

        <div className={styles.chatHistory} ref={chatHistoryRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageContainer} ${
                msg.isUser ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          ))}
        </div>

        <div className={styles.chatInputContainer}>
          <input
            ref={inputRef}
            type="text"
            className={styles.chatInput}
            placeholder={
              taskContext ? 'Ask questions or share your progress...' : PROMPTS.CHAT_PLACEHOLDER
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={() => handleSend()}>
            ↑
          </button>
        </div>
        <div className={styles.inputLabel}>{PROMPTS.INPUT_LABEL}</div>
      </div>
    </div>
  );
};

export default ChatPage;
