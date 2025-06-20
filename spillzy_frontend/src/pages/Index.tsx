
import React, { useState, useRef, useEffect } from 'react';
import UserInfoModal from '../components/UserInfoModal';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const apiURL = import.meta.env.VITE_DJANGO_API_URL;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface UserInfo {
  name: string;
  gender: string;
  age: string;
}

const Index = () => {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<string>('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleWelcomeMessage = (info: UserInfo | null) => {
    const welcomeMessage = info?.name
      ? `Hey ${info.name}! 👀 I'm Spillzy — your go-to bestie for spilling tea, decoding drama, and reacting to all the juicy stuff you throw my way. What's the latest gossip you’ve got for me today? ✨`
      : "Hey bestie! 👀 I'm Spillzy — your go-to tea spiller and drama decoder. Drop the scoop, the rumor, the messy situation… and let’s talk about it like we’re on FaceTime. What’s the tea today? ✨";

    setMessages([{
      id: Date.now().toString(),
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    const storedName = Cookies.get('userName');
    const storedGender = Cookies.get('userGender');
    const storedAge = Cookies.get('userAge');
    let storedKey = Cookies.get('user_key');
    const storedChatHistory = Cookies.get('chat_history');

    if (!storedKey) {
      storedKey = uuidv4();
      Cookies.set('user_key', storedKey, { expires: 365 });
    }

    if (storedChatHistory) {
      setChatHistory(storedChatHistory);
    }
  
    if (storedName || storedGender || storedAge || storedKey) {
      const loadedUserInfo: UserInfo = {
        name: storedName || '',
        gender: storedGender || '',
        age: storedAge || '',
      };
      setUserInfo(loadedUserInfo);
      setShowModal(false);
      setSidebarOpen(true);
      handleWelcomeMessage(loadedUserInfo);
    } else {
      setShowModal(true);
      setSidebarOpen(false);
      handleWelcomeMessage(null);
    }
  }, []);

  const handleUserInfoSubmit = async (info: UserInfo | null) => {
    setUserInfo(info);
    setShowModal(false);
    setSidebarOpen(!!info);

    if (info) {
      Cookies.set('userName', info.name, { expires: 365 });
      Cookies.set('userGender', info.gender, { expires: 365 });
      Cookies.set('userAge', info.age, { expires: 365 });
      Cookies.set('user_key', uuidv4(), { expires: 365 });

      try {
        await fetch(import.meta.env.VITE_DJANGO_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_info: {
              name: info.name,
              age: info.age,
              gender: info.gender
            }
          }),
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to save user info:', error);
      }
    } else {
      Cookies.remove('userName');
      Cookies.remove('userGender');
      Cookies.remove('userAge');
      Cookies.remove('user_key');
      Cookies.remove('chat_history');
      setChatHistory('');
    }

    handleWelcomeMessage(info);
  };

  const handleDeleteCredentials = () => {
    Cookies.remove('userName');
    Cookies.remove('userGender');
    Cookies.remove('userAge');
    Cookies.remove('user_key');
    Cookies.remove('chat_history');
    setChatHistory('');
    Cookies.set('user_key', uuidv4(), { expires: 365 });
    setUserInfo(null);
    setShowModal(true);
    setSidebarOpen(false);
    setMessages([{
        id: Date.now().toString(),
        text: "Your credentials have been cleared. Please provide your info again if you wish to personalize your experience.",
        isUser: false,
        timestamp: new Date()
    }]);
  };

  const simulateAIResponse = async (userMessage: string) => {
      setIsThinking(true);
      
      try {
          const response = await fetch(apiURL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  user_prompt: userMessage,
                  user_name: userInfo?.name || '',
                  user_gender: userInfo?.gender || '',
                  user_age: userInfo?.age || '',
                  user_key: Cookies.get('user_key') || '',
                  chat_history: chatHistory,
              }),
              credentials: 'include',
          });
          
          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error || 'Failed to analyze text');
          }
          
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: data.result,
              isUser: false,
              timestamp: new Date()
          }]);

          if (data.chat_history) {
            console.log('Chat history size:', new Blob([data.chat_history]).size, 'bytes');
            setChatHistory(data.chat_history);
            Cookies.set('chat_history', data.chat_history, { expires: 365 });
            
            const savedHistory = Cookies.get('chat_history');
            console.log('Cookie saved successfully:', savedHistory);
          }

      } catch (error) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              text: `Something went wrong, try again later!`,
              isUser: false,
              timestamp: new Date()
          }]);
      } finally {
          setIsThinking(false);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    simulateAIResponse(inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <UserInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUserInfoSubmit}
      />

      {}
      <div className={`sidebar ${sidebarOpen && userInfo ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
          {sidebarOpen && userInfo && <h3>User Profile</h3>}
        </div>

        {sidebarOpen && userInfo && (
          <div className="sidebar-content">
            <div className="user-avatar">
              <div className="avatar-circle">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{userInfo.name}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{userInfo.gender}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{userInfo.age}</span>
              </div>
              {}
              <div className="detail-item">
                <button
                  onClick={handleDeleteCredentials}
                  className="btn-delete-credentials"
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    marginTop: '16px',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  Delete Credentials
                </button>
              </div>
            </div>
          </div>
        )}
        {sidebarOpen && userInfo && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto'
          }}>
            By continuing to use Spillzy, you agree to our use of cookies to enhance your personalized experience.
          </p>
        )}
      </div>

      {}
      <div className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <header className="app-header">
          <div className="header-content">
            <h1 className="site-title">Spillzy</h1>
            <div className="header-buttons">
              <button
                className="theme-toggle-btn"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <a href="https://www.paypal.com/ncp/payment/VU85BL5DLCF3N" target='_blank'>
              <button className="header-btn">Support</button>
              </a>
            </div>
          </div>
        </header>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="message ai-message">
                <div className="message-content">
                  <div className="thinking-indicator">
                    <div className="thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="thinking-text">Spillzy is thinking... 🧠</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <form onSubmit={handleSendMessage} className="chat-form">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Talk to me... 💬"
                  className="chat-input"
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!inputValue.trim() || isThinking}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        <footer className="app-footer">
          <p>Made by <a href="https://github.com/ikbalmed" target="_blank" rel="noopener noreferrer">Ikbal</a></p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
