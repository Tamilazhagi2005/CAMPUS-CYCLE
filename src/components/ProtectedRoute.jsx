import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, authInitializing } = useAppContext();

  if (authInitializing) {
    return (
      <div className="page-container flex-row-center" style={{ minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Checking authentication...</div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (!currentUser?.VerifiedCollegeEmail) return <Navigate to="/verify-email" replace />;

  return children;
};

export default ProtectedRoute;
