import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Inbox } from 'lucide-react';

const ChatList = () => {
  const {
    chats,
    currentUser,
    loadingChats
  } = useAppContext();

  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div
        className="page-container flex-row-center"
        style={{
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <p>Please login to view chats.</p>

        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
          style={{ width: '200px' }}
        >
          Login
        </button>
      </div>
    );
  }

  if (loadingChats) {
    return (
      <div className="page-container">
        Loading chats...
      </div>
    );
  }

  const myChats = chats.filter(
    chat =>
      chat.BuyerEmail === currentUser.Email ||
      chat.SellerEmail === currentUser.Email
  );

  return (
    <div
      className="page-container"
      style={{ paddingBottom: '90px' }}
    >
      <h2
        style={{
          marginBottom: '20px',
          color: 'var(--primary-dark)'
        }}
      >
        My Chats
      </h2>

      {myChats.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '50px',
            color: 'var(--text-muted)'
          }}
        >
          <Inbox
            size={48}
            style={{
              marginBottom: '10px',
              opacity: 0.5
            }}
          />

          <p>No active conversations found.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {myChats.map(chat => {
            const isBuyer =
              chat.BuyerEmail === currentUser.Email;

            const otherPersonName = isBuyer
              ? chat.SellerName
              : chat.BuyerName;

            const lastMessage =
              chat.LastMessage ||
              'No messages yet';

            return (
              <div
                key={chat.id}
                className="glass-card"
                style={styles.chatCard}
                onClick={() =>
                  navigate(`/chat/${chat.id}`)
                }
              >
                <div style={styles.avatar}>
                  {otherPersonName?.charAt(0)}
                </div>

                <div style={styles.chatInfo}>
                  <div className="flex-row-between">
                    <span style={styles.name}>
                      {otherPersonName}
                    </span>

                    <span style={styles.itemRef}>
                      {chat.ItemName}
                    </span>
                  </div>

                  <p style={styles.lastMsg}>
                    {lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  chatCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    cursor: 'pointer'
  },

  avatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    flexShrink: 0
  },

  chatInfo: {
    flex: 1,
    overflow: 'hidden'
  },

  name: {
    fontWeight: '700',
    fontSize: '1rem'
  },

  itemRef: {
    fontSize: '0.75rem',
    color: 'green'
  },

  lastMsg: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default ChatList;