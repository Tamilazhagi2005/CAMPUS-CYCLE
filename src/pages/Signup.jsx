import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { auth, db, isFirebaseConfigured, isAuthorizedHost, actionCodeSettings } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Toast from '../components/Toast';
import { getAuthErrorMessage, normalizeEmail } from '../utils/authHelpers';

const DEPARTMENTS = [
  'Artificial Intelligence and Data Science (ADS)',
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Fashion Technology (FT)',
  'Textile Technology (TT)',
];

const GIRLS_HOSTEL_BLOCKS = [
  'Seeta A Block',
  'Seeta B Block',
  'Seeta C Block',
  'Vishalakshi Block',
  'Meenakshi Block',
];

const Signup = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    department: '',
    graduatingYear: '',
    commuteType: '',
    hostelType: '',
    hostelBlock: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register number is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.department) newErrors.department = 'Department is required.';
    if (!formData.graduatingYear.trim()) newErrors.graduatingYear = 'Graduating year is required.';
    if (!formData.commuteType) newErrors.commuteType = 'Commute type is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setToast({ type: '', message: '' });
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!isFirebaseConfigured) {
      setFormError('Firebase is not configured. Check your environment variables.');
      return;
    }

    if (!isAuthorizedHost) {
      setFormError('This host is not authorized for Firebase authentication. Confirm your deployed domain or localhost setup.');
      return;
    }

    const email = normalizeEmail(formData.email);

    // enforce strict college domain
    if (!email.endsWith('@sonatech.ac.in')) {
      setErrors({ email: 'Please use your official @sonatech.ac.in email address.' });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;
      const userUid = user.uid;

      try {
        await sendEmailVerification(user, actionCodeSettings);
      } catch (verificationError) {
        console.error('Verification send failed:', verificationError);
        throw verificationError;
      }

      const newUser = {
        UserID: userUid,
        Name: formData.name,
        RegisterNumber: formData.registerNumber,
        Department: formData.department,
        GraduatingYear: formData.graduatingYear,
        HostellerOrDayScholar: formData.commuteType,
        HostelType: formData.hostelType || '',
        HostelBlock: formData.hostelBlock || '',
        Email: email,
        SellerRating: 5.0,
        VerifiedCollegeEmail: false,
        ItemsReused: 0,
        PointsEarned: 0,
        ItemsSold: 0,
        CreatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'Users', userUid), newUser);
      setCurrentUser({ ...newUser, VerifiedCollegeEmail: false });
      setToast({ type: 'success', message: 'Verification email sent. Please check your inbox and spam folder.' });
      navigate('/verify-email');
    } catch (error) {
      console.error('Signup error:', error);
      const message = getAuthErrorMessage(error);
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: message });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: message });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: message });
      } else {
        setFormError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex-row-center" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '520px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create an account</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <label style={styles.label}>
            Name
            <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </label>

          <label style={styles.label}>
            Register Number
            <input name="registerNumber" value={formData.registerNumber} onChange={handleChange} className="input-field" />
            {errors.registerNumber && <div className="error-text">{errors.registerNumber}</div>}
          </label>

          <label style={styles.label}>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </label>

          <label style={styles.label}>
            Department
            <select name="department" value={formData.department} onChange={handleChange} className="input-field">
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <div className="error-text">{errors.department}</div>}
          </label>

          <label style={styles.label}>
            Graduating Year
            <input type="number" name="graduatingYear" value={formData.graduatingYear} onChange={handleChange} className="input-field" />
            {errors.graduatingYear && <div className="error-text">{errors.graduatingYear}</div>}
          </label>

          <label style={styles.label}>
            Commute Type
            <select name="commuteType" value={formData.commuteType} onChange={handleChange} className="input-field">
              <option value="">Select commute type</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>
            {errors.commuteType && <div className="error-text">{errors.commuteType}</div>}
          </label>

          {formData.commuteType === 'Hosteller' && (
            <>
              <label style={styles.label}>
                Hostel Type
                <select name="hostelType" value={formData.hostelType} onChange={handleChange} className="input-field">
                  <option value="">Select hostel type</option>
                  <option value="Girls">Girls</option>
                  <option value="Boys">Boys</option>
                </select>
              </label>

              <label style={styles.label}>
                Hostel Block
                <select name="hostelBlock" value={formData.hostelBlock} onChange={handleChange} className="input-field">
                  <option value="">Select hostel block</option>
                  {GIRLS_HOSTEL_BLOCKS.map((block) => (
                    <option key={block} value={block}>{block}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          <label style={styles.label}>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </label>

          <label style={styles.label}>
            Confirm Password
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </label>

          {formError && <div className="error-text" style={{ textAlign: 'center' }}>{formError}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Login</Link>
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

const styles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
};

export default Signup;
