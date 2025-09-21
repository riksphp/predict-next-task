import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ChatPage.module.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevInitialMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && prevInitialMessageRef.current !== initialMessage) {
      handleSend(initialMessage);
      prevInitialMessageRef.current = initialMessage;
    }
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

  const handleSend = (textToSend?: string): void => {
    const messageText = textToSend || message;
    if (messageText.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: messageText.trim(),
        isUser: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!textToSend) setMessage('');

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: "I'm here to help! This is a placeholder response.",
          isUser: false,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            ←
          </button>
          <span className={styles.chatTitle}>Chat with Assistant</span>
        </div>

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
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={() => handleSend()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
