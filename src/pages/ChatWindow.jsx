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

  const chat = chats.find(c => String(c.ChatID) === String(chatId));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  if (!currentUser) {
    return <div className="page-container">Please login first.</div>;
  }

  if (!chat) {
    return <div className="page-container">Chat not found.</div>;
  }

  const isBuyer = chat.BuyerEmail === currentUser.Email;

  const otherPersonName = isBuyer
    ? chat.SellerName
    : chat.BuyerName || chat.BuyerEmail || "Buyer";

  const handleSend = (e) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const newMessage = {
      MsgID: Date.now().toString(),
      Sender: currentUser.Email,
      SenderName: currentUser.Name,
      Text: inputText.trim(),
      Timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setChats(prev =>
      prev.map(c =>
        String(c.ChatID) === String(chatId)
          ? {
              ...c,
              Messages: [...(c.Messages || []), newMessage]
            }
          : c
      )
    );

    setInputText('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>

        <div>
          <h2 style={{ margin: 0 }}>{otherPersonName}</h2>
          <span style={{ fontSize: '0.8rem', color: 'green' }}>
            Regarding: {chat.ItemName}
          </span>
        </div>
      </div>

      <div style={styles.messagesArea}>
        {!chat.Messages || chat.Messages.length === 0 ? (
          <div style={styles.emptyState}>No messages yet</div>
        ) : (
          chat.Messages.map(msg => {
            const isMe = msg.Sender === currentUser.Email;

            return (
              <div
                key={msg.MsgID}
                style={{
                  ...styles.messageBlock,
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    backgroundColor: isMe ? 'green' : '#f1f1f1',
                    color: isMe ? 'white' : 'black'
                  }}
                >
                  {msg.Text}
                </div>

                <span style={styles.timestamp}>
                  {msg.Timestamp}
                </span>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.input}
        />

        <button
          type="submit"
          style={styles.sendBtn}
          disabled={!inputText.trim()}
        >
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
    height: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    borderBottom: '1px solid #ddd'
  },
  backBtn: {
    background: 'none',
    border: 'none'
  },
  messagesArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    gap: '10px',
    overflowY: 'auto'
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '50px'
  },
  messageBlock: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '75%'
  },
  bubble: {
    padding: '10px 15px',
    borderRadius: '18px'
  },
  timestamp: {
    fontSize: '0.7rem',
    marginTop: '5px'
  },
  inputArea: {
    display: 'flex',
    padding: '10px',
    gap: '10px',
    borderTop: '1px solid #ddd'
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid #ccc'
  },
  sendBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'green',
    color: 'white',
    border: 'none'
  }
};

export default ChatWindow;