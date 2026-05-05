import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusSquare, List, MessageSquare, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const hideNavOnPages = ['/login', '/signup', '/chat/'];
  
  if (hideNavOnPages.some(path => location.pathname.includes(path))) {
    return null;
  }

  return (
    <nav style={styles.navContainer} className="glass-card">
      <NavItem to="/home" icon={<Home size={24} />} label="Home" />
      <NavItem to="/post-item" icon={<PlusSquare size={24} />} label="Post" />
      <NavItem to="/my-listings" icon={<List size={24} />} label="Listings" />
      <NavItem to="/chats" icon={<MessageSquare size={24} />} label="Chats" />
      <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        ...styles.navItem,
        color: isActive ? 'var(--primary-color)' : 'var(--text-muted)'
      })}
    >
      {icon}
      <span style={styles.label}>{label}</span>
    </NavLink>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '600px',
    height: '70px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '500',
  }
};

export default BottomNav;
