import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { auth, db } from '../firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { signOut, updatePassword, deleteUser } from 'firebase/auth';

const Settings = () => {
  const { currentUser, setCurrentUser, theme, setTheme } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ Name: '', Department: '', GraduatingYear: '' });
  const [prefs, setPrefs] = useState({ chatNotifications: true, soldNotifications: true });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setForm({ Name: currentUser.Name || '', Department: currentUser.Department || '', GraduatingYear: currentUser.GraduatingYear || '' });
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'Users', currentUser.UserID), { Name: form.Name, Department: form.Department, GraduatingYear: form.GraduatingYear });
      setCurrentUser((prev) => ({ ...(prev || {}), Name: form.Name, Department: form.Department, GraduatingYear: form.GraduatingYear }));
      setEditing(false);
      setMessage('Profile updated');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    const newPass = prompt('Enter new password (min 6 chars):');
    if (!newPass) return;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      await updatePassword(auth.currentUser, newPass);
      setMessage('Password updated');
    } catch (err) {
      console.error(err);
      setMessage('Failed to change password. You may need to re-login and try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out failed', err);
    }
    setCurrentUser(null);
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This removes your auth account and user document.')) return;
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      // delete Firestore user doc first
      try {
        await updateDoc(doc(db, 'Users', currentUser.UserID), { DeletedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Failed to mark user deleted in Firestore', err);
      }

      await deleteUser(auth.currentUser);
      setCurrentUser(null);
      navigate('/signup');
    } catch (err) {
      console.error('Delete account failed', err);
      setMessage('Failed to delete account. You may need to re-login and try again.');
    }
  };

  const togglePref = async (key) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'Users', currentUser.UserID), { [`Prefs.${key}`]: next });
    } catch (err) {
      console.warn('Failed to save preference', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="page-container flex-row-center" style={{ flexDirection: 'column', gap: '15px' }}>
        <p>Please login to view settings.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Settings</h2>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Account Info</h3>
        <p><strong>Name:</strong> {currentUser?.Name || ''}</p>
        <p><strong>Email:</strong> {currentUser?.Email || ''}</p>
        <p><strong>Department:</strong> {currentUser?.Department || ''}</p>
        <p><strong>Graduating Year:</strong> {currentUser?.GraduatingYear || ''}</p>
        <p><strong>Verified:</strong> {currentUser?.VerifiedCollegeEmail ? 'Yes' : 'No'}</p>
      </section>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Edit Profile</h3>
        {editing ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            <input className="input-field" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
            <input className="input-field" value={form.Department} onChange={(e) => setForm({ ...form, Department: e.target.value })} />
            <input className="input-field" value={form.GraduatingYear} onChange={(e) => setForm({ ...form, GraduatingYear: e.target.value })} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" onClick={handleSaveProfile}>Save</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        )}
      </section>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Security</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handleChangePassword}>Change password</button>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          <button className="btn-link" onClick={handleDeleteAccount} style={{ color: 'var(--error)' }}>Delete account</button>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>{message}</p>
      </section>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Appearance</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={() => setTheme('light')}>Light</button>
          <button className="btn-secondary" onClick={() => setTheme('dark')}>Dark</button>
        </div>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Current theme: {theme}</p>
      </section>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Notifications</h3>
        <label><input type="checkbox" checked={prefs.chatNotifications} onChange={() => togglePref('chatNotifications')} /> Chat notifications</label>
        <br />
        <label><input type="checkbox" checked={prefs.soldNotifications} onChange={() => togglePref('soldNotifications')} /> Sold item notifications</label>
      </section>

      <section className="glass-card" style={{ padding: '16px', marginTop: '12px' }}>
        <h3>Privacy</h3>
        <label><input type="checkbox" defaultChecked={true} /> Show department publicly</label>
        <br />
        <label><input type="checkbox" defaultChecked={true} /> Show graduation year</label>
      </section>
    </div>
  );
};

export default Settings;
