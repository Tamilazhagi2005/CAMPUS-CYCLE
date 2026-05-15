import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const DEPARTMENTS = [
  'Artificial Intelligence and Data Science (ADS)',
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Fashion Technology (FT)',
  'Textile Technology (TT)'
];

const GIRLS_HOSTEL_BLOCKS = [
  'Seeta A Block',
  'Seeta B Block',
  'Seeta C Block',
  'Vishalakshi Block',
  'Meenakshi Block'
];

const Signup = () => {
  const navigate = useNavigate();
  const { setUsers } = useAppContext();

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
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      let userUid = `${Date.now()}`;

      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        userUid = userCredential.user.uid;
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
        Email: formData.email,
        Password: formData.password,
        SellerRating: 5.0,
        VerifiedBadge: true,
        CreatedAt: new Date().toISOString()
      };

      if (isFirebaseConfigured) {
        await setDoc(doc(db, 'Users', userUid), newUser);
      }

      setUsers((prev) => {
        const updated = [...prev, newUser];
        localStorage.setItem('campuscycle_users', JSON.stringify(updated));
        return updated;
      });

      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);

      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered.' });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email address.' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: 'Password must be at least 6 characters.' });
      } else {
        setFormError(error.message || 'Failed to create account. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex-row-center" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '500px' }}>
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
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  }
};

export default Signup;
