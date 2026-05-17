import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layout & Context
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import PostItem from './pages/PostItem';
import UserListings from './pages/UserListings';
import MyListings from './pages/MyListings';
import Settings from './pages/Settings';
import ChatList from './pages/ChatList';
import Profile from './pages/Profile';
import ItemDetails from './pages/ItemDetails';
import ChatWindow from './pages/ChatWindow';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/post-item" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
            <Route path="/post" element={<ProtectedRoute><PostItem /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/listings" element={<ProtectedRoute><UserListings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/chats" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/item/:itemId" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
