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
import ChatList from './pages/ChatList';
import Profile from './pages/Profile';
import ItemDetails from './pages/ItemDetails';
import ChatWindow from './pages/ChatWindow';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes wrapped later, or direct access for now */}
            <Route path="/home" element={<Home />} />
            <Route path="/post-item" element={<PostItem />} />
            <Route path="/my-listings" element={<UserListings />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<ChatWindow />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/item/:itemId" element={<ItemDetails />} />
            
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
