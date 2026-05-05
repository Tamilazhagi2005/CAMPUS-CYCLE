import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Leaf } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { users, setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch User Profile from Firestore
      const userDocRef = doc(db, "Users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // 3. Set Current User Context
        setCurrentUser(userData);
        navigate('/home');
      } else {
        // Document didn't exist but auth succeeded is an edge case
        console.error("No such user document!");
        setError("User profile data not found.");
      }

    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
         setError('Invalid email or password. Are you registered?');
      } else {
         setError('Login failed. Please try again later.');
      }
    }
  };

  return (
    <div className="page-container flex-row-center" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            marginBottom: '10px' 
          }}>
            <Leaf size={32} />
          </div>
          <h2>Welcome to CampusCycle</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sona College Reuse Marketplace</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <input 
              type="email" 
              placeholder="College Email (@sonatech.ac.in)" 
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-text" style={{ textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link to="/signup" style={{ fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
