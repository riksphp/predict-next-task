import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROMPTS } from '../data-layer/prompts';
import { extractContext } from '../services/contextService';
import { saveUserInput } from '../data-layer/userInputStorage';
import {
  getOrCreateDefaultThread,
  getMessages,
  addMessage,
} from '../data-layer/conversationStorage';
import styles from './ChatPage.module.css';

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

  useEffect(() => {
    (async () => {
      const thread = await getOrCreateDefaultThread();
      setThreadId(thread.id);
      const persisted = await getMessages(thread.id);
      setMessages(
        persisted.map((m) => ({
          id: Date.parse(m.timestamp),
          text: m.text,
          isUser: m.role === 'user',
        })),
      );
      // Check for task context from ResponsePage
      const taskCtx = location.state?.taskContext;
      if (taskCtx) {
        setTaskContext(taskCtx);
      }

      const initialMessage = location.state?.initialMessage;
      if (initialMessage && prevInitialMessageRef.current !== initialMessage) {
        prevInitialMessageRef.current = initialMessage;
        await handleSend(initialMessage);
      }
    })();
  }, [location.state]);

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

      // Extract context using Gemini
      const result = await extractContext(messageText.trim(), threadId || undefined);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: result.serverResponse,
        isUser: false,
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
