import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Send, ArrowLeft } from 'lucide-react';

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, setChats, currentUser } = useAppContext();
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef(null);

  const chat = chats.find(c => c.ChatID === chatId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.Messages]);

  if (!currentUser || !chat) {
    return <div className="page-container">Chat not found or access denied.</div>;
  }

  const isBuyer = chat.BuyerEmail === currentUser.Email;
  const otherPersonName = isBuyer ? chat.SellerName : 'Buyer';

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      MsgID: Date.now().toString(),
      Sender: currentUser.Email,
      Text: inputText.trim(),
      Timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => {
      if (c.ChatID === chatId) {
        return { ...c, Messages: [...c.Messages, newMessage] };
      }
      return c;
    }));
    setInputText('');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><ArrowLeft size={24} /></button>
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{otherPersonName}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>Regarding: {chat.ItemName}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesArea}>
        {chat.Messages.length === 0 ? (
          <div style={styles.emptyState}>No messages yet. Say hi!</div>
        ) : (
          chat.Messages.map(msg => {
            const isMe = msg.Sender === currentUser.Email;
            return (
              <div key={msg.MsgID} style={{ ...styles.messageBlock, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.bubble, backgroundColor: isMe ? 'var(--primary-color)' : '#f1f1f1', color: isMe ? 'white' : 'var(--text-main)' }}>
                  {msg.Text}
                </div>
                <span style={styles.timestamp}>{msg.Timestamp}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          style={styles.input} 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" style={styles.sendBtn} disabled={!inputText.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-color)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'var(--surface-color)',
    borderBottom: '1px solid var(--border-color)',
    gap: '15px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: 'var(--shadow-sm)'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
  },
  messagesArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    paddingBottom: '80px', // space for input
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    marginTop: '40px',
  },
  messageBlock: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
  },
  bubble: {
    padding: '10px 15px',
    borderRadius: '18px',
    fontSize: '0.95rem',
    lineHeight: '1.4',
  },
  timestamp: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    alignSelf: 'flex-end',
  },
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    padding: '10px 15px',
    backgroundColor: 'var(--surface-color)',
    borderTop: '1px solid var(--border-color)',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    fontSize: '0.95rem',
    backgroundColor: '#f9f9f9',
    outline: 'none',
  },
  sendBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  }
};

export default ChatWindow;
