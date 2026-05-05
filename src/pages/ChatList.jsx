import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Inbox } from 'lucide-react';

const ChatList = () => {
  const { chats, currentUser } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="page-container flex-row-center" style={{ flexDirection: 'column', gap: '15px' }}>
        <p>Please login to view your chats.</p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '200px' }}>Login</button>
      </div>
    );
  }

  const myChats = chats.filter(c => c.BuyerEmail === currentUser.Email || c.SellerEmail === currentUser.Email);

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>My Chats</h2>
      
      {myChats.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
          <Inbox size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
          <p>No active conversations found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myChats.map(chat => {
            const isBuyer = chat.BuyerEmail === currentUser.Email;
            const otherPersonName = isBuyer ? chat.SellerName : 'Interested Buyer';
            const lastMessage = chat.Messages.length > 0 
                ? chat.Messages[chat.Messages.length - 1].Text 
                : 'No messages yet...';

            return (
              <div 
                key={chat.ChatID} 
                className="glass-card" 
                style={styles.chatCard}
                onClick={() => navigate(`/chat/${chat.ChatID}`)}
              >
                <div style={styles.avatar}>{otherPersonName.charAt(0)}</div>
                <div style={styles.chatInfo}>
                  <div className="flex-row-between">
                    <span style={styles.name}>{otherPersonName}</span>
                    <span style={styles.itemRef}>{chat.ItemName}</span>
                  </div>
                  <p style={styles.lastMsg}>{lastMessage}</p>
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
    cursor: 'pointer',
    transition: 'background-color 0.2s',
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
    flexShrink: 0,
  },
  chatInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  name: {
    fontWeight: '700',
    color: 'var(--text-main)',
    fontSize: '1.05rem',
  },
  itemRef: {
    fontSize: '0.75rem',
    color: 'var(--primary-color)',
    fontWeight: '600',
    backgroundColor: 'rgba(47, 138, 74, 0.1)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  },
  lastMsg: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
};

export default ChatList;
