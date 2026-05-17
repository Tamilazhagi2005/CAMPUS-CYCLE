import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { auth, db, isAuthorizedHost, actionCodeSettings } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import Toast from '../components/Toast';

const VerifyEmail = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!isAuthorizedHost) {
      setToast({ type: 'error', message: 'This host is not authorized for Firebase auth. Verify your deployment domain.' });
      return;
    }

    if (!auth.currentUser) {
      setToast({ type: 'warning', message: 'Please log in again to resend the verification email.' });
      return;
    }

    try {
      setSending(true);
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      setToast({ type: 'success', message: 'Verification email resent. Check your inbox and spam folder.' });
      setCooldown(60);
    } catch (err) {
      console.error('Resend verification failed:', err);
      setToast({ type: 'error', message: 'Unable to resend verification email. Try again in a moment.' });
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setChecking(true);
      if (!auth.currentUser) {
        setToast({ type: 'warning', message: 'You are not currently authenticated. Please login again.' });
        navigate('/login');
        return;
      }

      await auth.currentUser.reload();
      const u = auth.currentUser;

      if (u.emailVerified) {
        try {
          await updateDoc(doc(db, 'Users', u.uid), { VerifiedCollegeEmail: true });
        } catch (updateError) {
          console.warn('Unable to update Firestore verification state:', updateError);
        }

        setCurrentUser((prev) => ({ ...(prev || {}), VerifiedCollegeEmail: true }));
        setToast({ type: 'success', message: 'Email verified successfully! Redirecting to home...' });
        navigate('/home');
      } else {
        setToast({ type: 'warning', message: 'Email still not verified. Check your inbox or spam folder.' });
      }
    } catch (err) {
      console.error('Verification refresh failed:', err);
      setToast({ type: 'error', message: 'Unable to refresh verification status. Try again later.' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="page-container flex-row-center" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '580px' }}>
        <h2 style={{ textAlign: 'center' }}>Verify your college email</h2>
        <p style={{ textAlign: 'center', lineHeight: '1.6', marginTop: '16px' }}>
          A verification email was sent to <strong>{currentUser?.Email || 'your email'}</strong>. Please open your college inbox and click the link to continue.
        </p>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '6px' }}>
          If you do not see the email, check your spam folder or try resending after the cooldown.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleResend} disabled={sending || cooldown > 0}>
            {sending ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification email'}
          </button>
          <button className="btn-secondary" onClick={handleRefresh} disabled={checking}>
            {checking ? 'Checking...' : 'Refresh verification status'}
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button className="btn-link" onClick={() => navigate('/login')}>Return to login</button>
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

export default VerifyEmail;
