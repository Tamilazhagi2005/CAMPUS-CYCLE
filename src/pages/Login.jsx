import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Leaf } from 'lucide-react';
import { auth, db, isFirebaseConfigured, isAuthorizedHost } from '../firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Toast from '../components/Toast';
import { getAuthErrorMessage, normalizeEmail } from '../utils/authHelpers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setToast({ type: '', message: '' });

    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Contact the administrator.');
      return;
    }

    if (!isAuthorizedHost) {
      setError('This domain is not allowed for Firebase authentication. Check frontend domain settings.');
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const { user } = userCredential;
      const userDocRef = doc(db, 'Users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let userData = userDocSnap.exists() ? userDocSnap.data() : null;

      if (user.emailVerified && userData && !userData.VerifiedCollegeEmail) {
        try {
          await updateDoc(userDocRef, { VerifiedCollegeEmail: true });
          userData.VerifiedCollegeEmail = true;
        } catch (updateError) {
          console.warn('Failed to update VerifiedCollegeEmail:', updateError);
        }
      }

      const sessionUser = {
        UserID: user.uid,
        Email: user.email || normalizedEmail,
        Name: userData?.Name || user.displayName || normalizedEmail,
        VerifiedCollegeEmail: Boolean(user.emailVerified),
        SellerRating: userData?.SellerRating || 5.0,
        Department: userData?.Department || '',
        GraduatingYear: userData?.GraduatingYear || '',
        ...userData,
      };

      if (!user.emailVerified) {
        setCurrentUser({ ...sessionUser, VerifiedCollegeEmail: false });
        setToast({ type: 'warning', message: 'Your email is not verified. Please check inbox/spam.' });
        navigate('/verify-email');
        return;
      }

      setCurrentUser(sessionUser);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex-row-center" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              marginBottom: '10px',
            }}
          >
            <Leaf size={32} />
          </div>
          <h2>Welcome to CampusCycle</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sona College Reuse Marketplace</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <input
              type="email"
              placeholder="College Email"
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

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? 'Checking credentials...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link to="/signup" style={{ fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: '', message: '' })}
      />
    </div>
  );
};

export default Login;
