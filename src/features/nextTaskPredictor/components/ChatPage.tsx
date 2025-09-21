import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChatPage.module.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(): void {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: message.trim(),
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          text: "I'm here to help! This is a placeholder response.",
          isUser: false
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }
  }

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
              className={`${styles.messageContainer} ${msg.isUser ? styles.userMessage : styles.assistantMessage}`}
            >
              <div className={styles.messageBubble}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chatInputContainer}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
