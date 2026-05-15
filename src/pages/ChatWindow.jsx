import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Send, ArrowLeft } from 'lucide-react';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase';

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, currentUser } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const bottomRef = useRef(null);

  const chat = chats.find(c => c.id === chatId);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'Chats', chatId, 'Messages'),
      orderBy('Timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMessages(msgs);
      },
      error => {
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="page-container">
        Please login first.
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="page-container">
        Loading chat...
      </div>
    );
  }

  const isBuyer =
    chat.BuyerEmail === currentUser.Email;

  const otherPersonName = isBuyer
    ? chat.SellerName
    : chat.BuyerName;

  const handleSend = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      await addDoc(
        collection(db, 'Chats', chatId, 'Messages'),
        {
          Sender: currentUser.Email,
          SenderName: currentUser.Name,
          Text: inputText.trim(),
          Timestamp: serverTimestamp()
        }
      );

      await updateDoc(
        doc(db, 'Chats', chatId),
        {
          LastMessage: inputText.trim(),
          UpdatedAt: serverTimestamp()
        }
      );

      setInputText('');

    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h3 style={{ margin: 0 }}>
            {otherPersonName}
          </h3>

          <span style={styles.subText}>
            {chat.ItemName}
          </span>
        </div>
      </div>

      <div style={styles.messagesArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            No messages yet
          </div>
        ) : (
          messages.map(msg => {
            const isMe =
              msg.Sender === currentUser.Email;

            return (
              <div
                key={msg.id}
                style={{
                  ...styles.messageBlock,
                  alignSelf: isMe
                    ? 'flex-end'
                    : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    backgroundColor: isMe
                      ? 'green'
                      : '#f1f1f1',
                    color: isMe
                      ? 'white'
                      : 'black'
                  }}
                >
                  {msg.Text}
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        style={styles.inputArea}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) =>
            setInputText(e.target.value)
          }
          style={styles.input}
        />

        <button
          type="submit"
          style={styles.sendBtn}
        >
          <Send size={18} />
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
    gap: '12px',
    padding: '15px',
    borderBottom: '1px solid #ddd'
  },

  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },

  subText: {
    fontSize: '0.8rem',
    color: '#777'
  },

  messagesArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    overflowY: 'auto'
  },

  emptyState: {
    textAlign: 'center',
    marginTop: '40px',
    color: '#777'
  },

  messageBlock: {
    display: 'flex',
    maxWidth: '75%'
  },

  bubble: {
    padding: '10px 14px',
    borderRadius: '18px'
  },

  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    borderTop: '1px solid #ddd'
  },

  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    outline: 'none'
  },

  sendBtn: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    background: 'green',
    color: 'white',
    cursor: 'pointer'
  }
};

export default ChatWindow;