import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { BadgeCheck, LogOut, Settings, List, MessageSquare } from 'lucide-react';

const Profile = () => {
  const { currentUser, setCurrentUser, items, chats } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="page-container flex-row-center" style={{ flexDirection: 'column', gap: '15px' }}>
        <p>Please login to view your profile.</p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '200px' }}>Login</button>
      </div>
    );
  }

  const userItems = items.filter(i => i.SellerEmail === currentUser.Email);
  const myChats = chats.filter(c => c.BuyerEmail === currentUser.Email || c.SellerEmail === currentUser.Email);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout failed:', err);
    }
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      
      {/* Profile Header Card */}
      <div className="glass-card" style={styles.headerCard}>
        <div style={styles.avatarLarge}>
          {currentUser.Name.charAt(0)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            {currentUser.Name}
            {currentUser.VerifiedBadge && <BadgeCheck size={22} color="var(--primary-color)" />}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {currentUser.Department} • {currentUser.Email}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={styles.badge}>Seller Rating: ★ {currentUser?.SellerRating || '5.0'}</span>
            <span style={styles.badge}>Verified Student</span>
            {currentUser?.GraduatingSoonStatus && (
              <span style={{ 
                ...styles.badge, 
                backgroundColor: 'rgba(255, 193, 7, 0.2)', 
                color: '#b30000', 
                fontWeight: 'bold' 
              }}>
                🎓 Graduating Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statBox} onClick={() => navigate('/my-listings')}>
          <div style={styles.statNumber}>{userItems.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Listings</div>
        </div>
        <div style={styles.statBox} onClick={() => navigate('/chats')}>
          <div style={styles.statNumber}>{myChats.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conversations</div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="glass-card" style={{ padding: '0 15px', marginTop: '20px' }}>
        <ul style={styles.menuList}>
          <li style={styles.menuItem} onClick={() => navigate('/my-listings')}>
            <List size={20} color="var(--primary-color)" /> My Listings
          </li>
          <li style={styles.menuItem} onClick={() => navigate('/chats')}>
            <MessageSquare size={20} color="var(--primary-dark)" /> My Chats
          </li>
          <li style={styles.menuItem} onClick={() => navigate('/settings')}>
            <Settings size={20} color="var(--text-muted)" /> Account Settings
          </li>
          <li style={{...styles.menuItem, borderBottom: 'none', color: 'var(--error)'}} onClick={handleLogout}>
            <LogOut size={20} color="var(--error)" /> Logout
          </li>
        </ul>
      </div>

    </div>
  );
};

const styles = {
  headerCard: {
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(47, 138, 74, 0.1) 0%, rgba(255,255,255,0.7) 100%)',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  badge: {
    backgroundColor: 'rgba(47, 138, 74, 0.1)',
    color: 'var(--primary-dark)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'var(--surface-color)',
    padding: '15px',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 5px',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    fontWeight: '500',
    color: 'var(--text-main)',
    transition: 'background-color 0.2s',
  }
};

export default Profile;
